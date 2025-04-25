const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { protect } = require('../middlewares/authMiddleware');
const User = require('../models/userModel');
const Balance = require('../models/balanceModel');
const StripeTransaction = require('../models/stripeTransaction');
const asyncHandler = require('express-async-handler');

// Calcular comisión de Stripe (aproximadamente 2.9% + 30¢)
const calculateStripeCommission = (amount) => {
  return (amount * 0.029) + 0.30;
};

// Crear una intención de pago (payment intent)
router.post('/create-payment-intent', protect, asyncHandler(async (req, res) => {
  const { amount } = req.body;
  
  if (!amount || isNaN(amount) || amount <= 0) {
    res.status(400);
    throw new Error('Por favor, proporcione un monto válido');
  }
  
  // Monto mínimo de recarga
  const minAmount = 10;
  if (amount < minAmount) {
    res.status(400);
    throw new Error(`El monto mínimo de recarga es $${minAmount}`);
  }
  
  try {
    // Crear un PaymentIntent con el monto y moneda
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Stripe usa centavos
      currency: 'usd',
      metadata: { 
        userId: req.user._id.toString(),
        userEmail: req.user.email 
      }
    });
    
    // Guardar la transacción en la base de datos
    await StripeTransaction.create({
      userId: req.user._id,
      paymentIntentId: paymentIntent.id,
      amount: amount,
      status: 'pending',
      commission: calculateStripeCommission(amount)
    });

    res.status(200).json({
      clientSecret: paymentIntent.client_secret
    });
  } catch (error) {
    console.error('Error al crear payment intent:', error);
    res.status(500);
    throw new Error('Error al procesar su solicitud de pago');
  }
}));

// Webhook para eventos de Stripe
router.post('/webhook', express.raw({type: 'application/json'}), asyncHandler(async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    // Verificar firma del webhook usando el endpoint secret
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error(`Error de firma: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Manejar el evento
  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object;
    await handleSuccessfulPayment(paymentIntent);
  }

  // Responder para confirmar recepción
  res.json({received: true});
}));

// Confirmar recarga después de un pago exitoso (respaldo al webhook)
router.post('/confirm-recharge', protect, asyncHandler(async (req, res) => {
  const { paymentIntentId } = req.body;
  
  if (!paymentIntentId) {
    res.status(400);
    throw new Error('ID de pago no proporcionado');
  }
  
  try {
    // Verificar el estado del PaymentIntent
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    
    if (paymentIntent.status === 'succeeded') {
      // Buscar la transacción en la base de datos
      const transaction = await StripeTransaction.findOne({ paymentIntentId });
      
      if (!transaction) {
        res.status(404);
        throw new Error('Transacción no encontrada');
      }
      
      // Si ya fue procesada, simplemente devolver éxito
      if (transaction.status === 'succeeded') {
        return res.status(200).json({ 
          success: true, 
          message: 'La recarga ya ha sido procesada anteriormente',
          amount: transaction.amount
        });
      }
      
      // Actualizar el saldo del usuario
      await handleSuccessfulPayment(paymentIntent);
      
      res.status(200).json({ 
        success: true, 
        message: 'Recarga completada con éxito',
        amount: transaction.amount
      });
    } else {
      res.status(400).json({ 
        success: false, 
        message: 'El pago no ha sido completado' 
      });
    }
  } catch (error) {
    console.error('Error al confirmar recarga:', error);
    res.status(500);
    throw new Error('Error al procesar la confirmación de recarga');
  }
}));

// Función para manejar un pago exitoso
async function handleSuccessfulPayment(paymentIntent) {
  const transaction = await StripeTransaction.findOne({ 
    paymentIntentId: paymentIntent.id 
  });
  
  if (!transaction || transaction.status === 'succeeded') {
    return; // Evitar procesamiento duplicado
  }
  
  const userId = paymentIntent.metadata.userId;
  const amount = transaction.amount;
  
  // Actualizar la transacción
  transaction.status = 'succeeded';
  transaction.updatedAt = Date.now();
  await transaction.save();
  
  // Buscar al usuario
  const user = await User.findById(userId);
  
  if (!user) {
    console.error(`Usuario no encontrado: ${userId}`);
    return;
  }
  
  // Actualizar el balance del usuario
  let userBalance = await Balance.findOne({ userId });
  
  if (!userBalance) {
    // Crear un nuevo balance si no existe
    userBalance = new Balance({
      userId,
      currentBalance: amount,
      totalRecharges: amount,
      lastRechargeDate: Date.now()
    });
  } else {
    // Actualizar balance existente
    userBalance.currentBalance += amount;
    userBalance.totalRecharges += amount;
    userBalance.lastRechargeDate = Date.now();
  }
  
  await userBalance.save();
  
  // Registrar la transacción en el historial
  // (asumiendo que tienes un modelo para transacciones generales)
  // await Transaction.create({
  //   userId,
  //   type: 'recharge',
  //   method: 'stripe',
  //   amount,
  //   description: 'Recarga con tarjeta (Stripe)',
  //   status: 'completed',
  //   paymentIntentId: paymentIntent.id
  // });
}

module.exports = router;