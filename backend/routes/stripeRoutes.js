// En un nuevo archivo: /routes/stripeRoutes.js
const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { protect } = require('../middlewares/authMiddleware');

// Crear una intención de pago (payment intent)
router.post('/create-payment-intent', protect, async (req, res) => {
  try {
    const { amount } = req.body;
    
    // Crear un PaymentIntent con el monto y moneda
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100, // Stripe usa centavos
      currency: 'usd',
      metadata: { userId: req.user.id }
    });

    res.status(200).json({
      clientSecret: paymentIntent.client_secret
    });
  } catch (error) {
    console.error('Error al crear payment intent:', error);
    res.status(500).json({ error: error.message });
  }
});

// Confirmar recarga después de un pago exitoso
router.post('/confirm-recharge', protect, async (req, res) => {
  try {
    const { paymentIntentId, amount } = req.body;
    
    // Verificar el estado del PaymentIntent
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    
    if (paymentIntent.status === 'succeeded') {
      // Actualizar el saldo del usuario en tu base de datos
      // Aquí iría la lógica para actualizar el saldo del usuario
      
      res.status(200).json({ 
        success: true, 
        message: 'Recarga completada con éxito',
        amount: amount
      });
    } else {
      res.status(400).json({ 
        success: false, 
        message: 'El pago no ha sido completado' 
      });
    }
  } catch (error) {
    console.error('Error al confirmar recarga:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;