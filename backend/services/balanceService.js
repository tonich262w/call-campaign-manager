javascript
const mongoose = require('mongoose');
const User = require('../models/userModel');
const Transaction = require('../models/transactionModel');
const voximplantService = require('./voximplantService');

class BalanceService {
  // Verificar si el usuario tiene saldo suficiente
  async hasEnoughBalance(userId, amount) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('Usuario no encontrado');
      }
      
      return user.balance >= amount;
    } catch (error) {
      console.error('Error al verificar saldo:', error);
      throw error;
    }
  }
  
  // Calcular costo de llamada con markup del 100%
  async calculateCallCost(duration, destination) {
    try {
      // Obtener costo real de Voximplant
      const realCost = await voximplantService.getCallCost(duration, destination);
      
      // Aplicar markup del 100%
      return realCost * 2;
    } catch (error) {
      console.error('Error al calcular costo de llamada:', error);
      // Valor por defecto en caso de error (con markup)
      return 0.02;
    }
  }
  
  // Agregar saldo al usuario
  async addBalance(userId, amount, paymentMethod, metadata = {}) {
    const session = await mongoose.startSession();
    session.startTransaction();
    
    try {
      // Validar monto
      if (amount <= 0) {
        throw new Error('El monto debe ser mayor a cero');
      }
      
      // Crear transacción
      const transaction = new Transaction({
        user: userId,
        amount,
        type: 'deposit',
        description: Recarga vía ${paymentMethod},
        status: 'completed',
        paymentMethod,
        metadata,
        reference: DEP-${Date.now()}-${Math.floor(Math.random() * 1000)},
      });
      
      await transaction.save({ session });
      
      // Actualizar saldo del usuario
      const user = await User.findByIdAndUpdate(
        userId,
        { $inc: { balance: amount } },
        { new: true, session }
      );
      
      if (!user) {
        throw new Error('Usuario no encontrado');
      }
      
      await session.commitTransaction();
      return {
        transaction,
        newBalance: user.balance,
      };
    } catch (error) {
      await session.abortTransaction();
      console.error('Error al agregar saldo:', error);
      throw error;
    } finally {
      session.endSession();
    }
  }
  
  // Descontar saldo por llamada
  async chargeForCall(userId, callDetails) {
    const callCost = await this.calculateCallCost(
      callDetails.duration,
      callDetails.destination
    );
    
    const session = await mongoose.startSession();
    session.startTransaction();
    
    try {
      // Verificar saldo suficiente
      const hasBalance = await this.hasEnoughBalance(userId, callCost);
      if (!hasBalance) {
        throw new Error('Saldo insuficiente');
      }
      
      // Crear transacción
      const transaction = new Transaction({
        user: userId,
        amount: -callCost,
        type: 'charge',
        description: Llamada a ${callDetails.destination},
        status: 'completed',
        metadata: callDetails,
        reference: CALL-${Date.now()}-${Math.floor(Math.random() * 1000)},
      });
      
      await transaction.save({ session });
      
      // Actualizar saldo del usuario
      const user = await User.findByIdAndUpdate(
        userId,
        { $inc: { balance: -callCost } },
        { new: true, session }
      );
      
      if (!user) {
        throw new Error('Usuario no encontrado');
      }
      
      await session.commitTransaction();
      return {
        transaction,
        newBalance: user.balance,
        callCost,
      };
    } catch (error) {
      await session.abortTransaction();
      console.error('Error al descontar saldo:', error);
      throw error;
    } finally {
      session.endSession();
    }
  }
}

module.exports = new BalanceService();