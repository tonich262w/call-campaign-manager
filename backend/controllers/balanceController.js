// controllers/balanceController.js
const { Balance, Transaction, Pricing } = require('../models/balanceModel');
const User = require('../models/userModel');
const Campaign = require('../models/campaignModel');
const mongoose = require('mongoose');
const voximplantService = require('../services/voximplantService');

// Obtener el saldo actual del usuario
const getUserBalance = async (req, res) => {
  try {
    const userId = req.user._id;
    
    let balance = await Balance.findOne({ userId });
    
    if (!balance) {
      // Si no existe un registro de saldo, creamos uno
      balance = await Balance.create({
        userId,
        currentBalance: 0,
        totalSpent: 0
      });
    }
    
    // Obtener la configuración de precios actual (solo la parte visible al cliente)
    const pricing = await Pricing.findOne({ active: true });
    
    // Intentamos obtener el saldo real de Voximplant
    let voximplantBalance = null;
    
    try {
      // Llamamos a la API real de Voximplant para obtener el saldo
      voximplantBalance = await voximplantService.getAccountBalance();
      
      console.log('Saldo real de Voximplant:', voximplantBalance);
      
      // Si tenemos éxito, actualizamos el saldo en la base de datos
      if (voximplantBalance && voximplantBalance.balance !== undefined) {
        // Solo actualizamos si el saldo es diferente para evitar actualizaciones innecesarias
        if (balance.currentBalance !== voximplantBalance.balance) {
          balance = await Balance.findOneAndUpdate(
            { userId },
            { 
              currentBalance: voximplantBalance.balance,
              lastUpdated: Date.now() 
            },
            { new: true }
          );
        }
      }
    } catch (voxError) {
      console.error('Error al obtener saldo simulado:', voxError);
      // Si hay un error, continuamos con el saldo almacenado en la base de datos
    }
    
    // Preparamos la respuesta con el saldo actualizado (ya sea de Voximplant o de la base de datos)
    const balanceInfo = {
      currentBalance: balance.currentBalance,
      totalSpent: balance.totalSpent,
      callRate: pricing ? pricing.callRate : 0.10,
      callMinuteRate: pricing ? pricing.callMinuteRate : 0.02,
      // Añadimos información sobre si el saldo proviene de Voximplant o de la base de datos
      source: voximplantBalance ? 'voximplant' : 'database',
      lastUpdated: balance.lastUpdated || new Date()
    };
    
    res.status(200).json(balanceInfo);
  } catch (error) {
    console.error('Error al obtener saldo:', error);
    res.status(500).json({ message: 'Error al obtener información del saldo' });
  }
};

// Obtener historial de transacciones del usuario
const getTransactionHistory = async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Buscamos transacciones completadas para este usuario
    const transactions = await Transaction.find({ 
      userId, 
      status: 'completed' 
    }).sort({ createdAt: -1 });
    
    // Filtramos los datos para no exponer información interna
    const clientTransactions = transactions.map(t => ({
      id: t._id,
      date: t.createdAt,
      type: t.type,
      amount: t.amount,  // Solo mostramos el monto inflado, no el real
      description: t.description,
      status: t.status,
      campaignId: t.campaignId
    }));
    
    res.status(200).json(clientTransactions);
  } catch (error) {
    console.error('Error al obtener historial:', error);
    res.status(500).json({ message: 'Error al obtener historial de transacciones' });
  }
};

// Recargar saldo del usuario
const rechargeBalance = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const userId = req.user._id;
    const { amount, paymentMethod, paymentDetails } = req.body;
    
    // Verificar monto mínimo
    const pricing = await Pricing.findOne({ active: true });
    if (amount < (pricing ? pricing.minRechargeAmount : 10)) {
      return res.status(400).json({ 
        message: `El monto mínimo de recarga es $${pricing ? pricing.minRechargeAmount : 10}` 
      });
    }
    
    // Crear la transacción
    const transaction = await Transaction.create([{
      userId,
      type: 'charge',
      amount: parseFloat(amount),
      realAmount: parseFloat(amount), // En recargas, el monto real es igual al cobrado
      profit: 0, // No hay ganancia en recargas
      description: 'Recarga de saldo',
      status: 'completed',
      paymentMethod,
      paymentDetails: paymentDetails || {}
    }], { session });
    
    // Actualizar el saldo
    const balance = await Balance.findOneAndUpdate(
      { userId },
      { 
        $inc: { currentBalance: parseFloat(amount) },
        $set: { lastUpdated: Date.now() }
      },
      { new: true, upsert: true, session }
    );
    
    await session.commitTransaction();
    session.endSession();
    
    res.status(200).json({ 
      message: 'Recarga realizada exitosamente',
      currentBalance: balance.currentBalance,
      transactionId: transaction[0]._id
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    
    console.error('Error en recarga:', error);
    res.status(500).json({ message: 'Error al procesar la recarga de saldo' });
  }
};

// Descontar saldo por consumo de campaña
const deductBalance = async (userId, campaignId, calls, minutes) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    // Obtener configuración de precios actual
    const pricing = await Pricing.findOne({ active: true });
    if (!pricing) {
      throw new Error('No hay configuración de precios disponible');
    }
    
    // Calcular costos (reales e inflados)
    const realCallCost = calls * pricing.realCallRate;
    const realMinuteCost = minutes * pricing.realCallMinuteRate;
    const totalRealCost = realCallCost + realMinuteCost;
    
    const chargedCallCost = calls * pricing.callRate;
    const chargedMinuteCost = minutes * pricing.callMinuteRate;
    const totalChargedCost = chargedCallCost + chargedMinuteCost;
    
    const profit = totalChargedCost - totalRealCost;
    
    // Verificar si hay saldo suficiente
    const balance = await Balance.findOne({ userId });
    if (!balance || balance.currentBalance < totalChargedCost) {
      throw new Error('Saldo insuficiente para realizar la operación');
    }
    
    // Obtener información de la campaña
    const campaign = await Campaign.findById(campaignId);
    if (!campaign) {
      throw new Error('Campaña no encontrada');
    }
    
    // Crear la transacción
    await Transaction.create([{
      userId,
      campaignId,
      type: 'expense',
      amount: totalChargedCost,
      realAmount: totalRealCost,
      profit: profit,
      description: `Consumo Campaña "${campaign.name}"`,
      status: 'completed'
    }], { session });
    
    // Actualizar el saldo
    await Balance.findOneAndUpdate(
      { userId },
      { 
        $inc: { 
          currentBalance: -totalChargedCost,
          totalSpent: totalChargedCost
        },
        $set: { lastUpdated: Date.now() }
      },
      { session }
    );
    
    await session.commitTransaction();
    session.endSession();
    
    return {
      success: true,
      deducted: totalChargedCost,
      newBalance: balance.currentBalance - totalChargedCost
    };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error('Error al descontar saldo:', error);
    throw error;
  }
};

// Verificar si el usuario tiene saldo suficiente para una campaña
const checkSufficientBalance = async (req, res) => {
  try {
    const userId = req.user._id;
    const { campaignId, estimatedCalls } = req.body;
    
    if (!campaignId || !estimatedCalls) {
      return res.status(400).json({ message: 'Datos incompletos' });
    }
    
    // Obtener balance del usuario
    const balance = await Balance.findOne({ userId });
    if (!balance) {
      return res.status(400).json({ 
        sufficient: false,
        message: 'No tiene saldo disponible' 
      });
    }
    
    // Obtener configuración de precios
    const pricing = await Pricing.findOne({ active: true });
    if (!pricing) {
      return res.status(500).json({ message: 'Error en configuración de precios' });
    }
    
    // Calcular costo estimado (solo usamos el costo inflado para el cliente)
    const estimatedCost = estimatedCalls * pricing.callRate;
    
    // Verificar si hay saldo suficiente
    const sufficient = balance.currentBalance >= estimatedCost;
    
    res.status(200).json({
      sufficient,
      currentBalance: balance.currentBalance,
      estimatedCost,
      remaining: balance.currentBalance - estimatedCost
    });
  } catch (error) {
    console.error('Error al verificar saldo:', error);
    res.status(500).json({ message: 'Error al verificar disponibilidad de saldo' });
  }
};

// Controladores solo para admins
// Obtener todas las transacciones con datos reales (admin)
const getAdminTransactions = async (req, res) => {
  try {
    // Verificar que el usuario es admin
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: 'Acceso denegado' });
    }
    
    const transactions = await Transaction.find()
      .sort({ createdAt: -1 })
      .populate('userId', 'name email')
      .populate('campaignId', 'name');
    
    res.status(200).json(transactions);
  } catch (error) {
    console.error('Error al obtener transacciones admin:', error);
    res.status(500).json({ message: 'Error al obtener datos de transacciones' });
  }
};

// Actualizar configuración de precios (admin)
const updatePricing = async (req, res) => {
  try {
    // Verificar que el usuario es admin
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: 'Acceso denegado' });
    }
    
    const {
      callRate,
      callMinuteRate,
      realCallRate,
      realCallMinuteRate,
      inflationRate,
      minRechargeAmount
    } = req.body;
    
    // Desactivar la configuración actual
    await Pricing.updateMany(
      { active: true },
      { active: false }
    );
    
    // Crear nueva configuración
    const newPricing = await Pricing.create({
      callRate: parseFloat(callRate),
      callMinuteRate: parseFloat(callMinuteRate),
      realCallRate: parseFloat(realCallRate),
      realCallMinuteRate: parseFloat(realCallMinuteRate),
      inflationRate: parseFloat(inflationRate),
      minRechargeAmount: parseFloat(minRechargeAmount),
      active: true,
      updatedBy: req.user._id
    });
    
    res.status(201).json({
      message: 'Configuración de precios actualizada',
      pricing: newPricing
    });
  } catch (error) {
    console.error('Error al actualizar precios:', error);
    res.status(500).json({ message: 'Error al actualizar configuración de precios' });
  }
};

// Añadir saldo manualmente (admin)
const addBalanceManually = async (req, res) => {
  // Verificar que el usuario es admin
  if (!req.user.isAdmin) {
    return res.status(403).json({ message: 'Acceso denegado' });
  }
  
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const { userId, amount, notes } = req.body;
    
    if (!userId || !amount) {
      return res.status(400).json({ message: 'Datos incompletos' });
    }
    
    // Verificar que el usuario existe
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    
    // Crear transacción
    const transaction = await Transaction.create([{
      userId,
      type: 'charge',
      amount: parseFloat(amount),
      realAmount: parseFloat(amount),
      profit: 0,
      description: notes || 'Recarga manual por administrador',
      status: 'completed',
      paymentMethod: 'admin'
    }], { session });
    
    // Actualizar saldo
    const balance = await Balance.findOneAndUpdate(
      { userId },
      { 
        $inc: { currentBalance: parseFloat(amount) },
        $set: { lastUpdated: Date.now() }
      },
      { new: true, upsert: true, session }
    );
    
    await session.commitTransaction();
    session.endSession();
    
    res.status(200).json({
      message: 'Saldo añadido manualmente',
      userId,
      amount,
      currentBalance: balance.currentBalance,
      transactionId: transaction[0]._id
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    
    console.error('Error al añadir saldo:', error);
    res.status(500).json({ message: 'Error al añadir saldo manualmente' });
  }
};

// Obtener resumen financiero (admin)
const getFinancialSummary = async (req, res) => {
  try {
    // Verificar que el usuario es admin
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: 'Acceso denegado' });
    }
    
    // Total de recargas
    const rechargesResult = await Transaction.aggregate([
      { $match: { type: 'charge', status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    
    // Total de consumos
    const expensesResult = await Transaction.aggregate([
      { $match: { type: 'expense', status: 'completed' } },
      { 
        $group: { 
          _id: null, 
          totalCharged: { $sum: '$amount' },
          totalReal: { $sum: '$realAmount' },
          totalProfit: { $sum: '$profit' }
        } 
      }
    ]);
    
    // Saldo disponible total
    const balanceResult = await Balance.aggregate([
      { $group: { _id: null, totalBalance: { $sum: '$currentBalance' } } }
    ]);
    
    const summary = {
      totalRecharges: rechargesResult.length > 0 ? rechargesResult[0].total : 0,
      totalCharged: expensesResult.length > 0 ? expensesResult[0].totalCharged : 0,
      totalRealCost: expensesResult.length > 0 ? expensesResult[0].totalReal : 0,
      totalProfit: expensesResult.length > 0 ? expensesResult[0].totalProfit : 0,
      availableBalance: balanceResult.length > 0 ? balanceResult[0].totalBalance : 0
    };
    
    res.status(200).json(summary);
  } catch (error) {
    console.error('Error al obtener resumen financiero:', error);
    res.status(500).json({ message: 'Error al generar resumen financiero' });
  }
};

module.exports = {
  getUserBalance,
  getTransactionHistory,
  rechargeBalance,
  deductBalance,
  checkSufficientBalance,
  getAdminTransactions,
  updatePricing,
  addBalanceManually,
  getFinancialSummary
};
