import React, { useState, useEffect } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import axios from 'axios';
import './StripePayment.css';

const StripePayment = ({ onSuccess }) => {
  const [amount, setAmount] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  const stripe = useStripe();
  const elements = useElements();

  const handleAmountChange = (e) => {
    setAmount(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!stripe || !elements) {
      // Stripe.js aún no ha cargado
      return;
    }
    
    // Validación del monto
    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
      setError('Por favor, ingrese un monto válido');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // 1. Crear un Payment Intent en el servidor
      const paymentIntentRes = await axios.post('/api/stripe/create-payment-intent', {
        amount: parseFloat(amount)
      });
      
      setClientSecret(paymentIntentRes.data.clientSecret);
      
      // 2. Confirmar el pago con Stripe.js
      const cardElement = elements.getElement(CardElement);
      
      const paymentResult = await stripe.confirmCardPayment(paymentIntentRes.data.clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            // Opcional: incluir datos del usuario si están disponibles
          }
        }
      });
      
      if (paymentResult.error) {
        setError(`Error de pago: ${paymentResult.error.message}`);
      } else if (paymentResult.paymentIntent.status === 'succeeded') {
        // 3. Confirmar la recarga en nuestro servidor
        const rechargeRes = await axios.post('/api/stripe/confirm-recharge', {
          paymentIntentId: paymentResult.paymentIntent.id,
          amount: parseFloat(amount)
        });
        
        if (rechargeRes.data.success) {
          setSuccess(true);
          setAmount('');
          cardElement.clear();
          
          // Llamar al callback de éxito para actualizar el balance en la UI
          if (onSuccess) {
            onSuccess(parseFloat(amount));
          }
        }
      }
    } catch (err) {
      console.error('Error al procesar el pago:', err);
      setError(err.message || 'Ha ocurrido un error al procesar el pago');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="stripe-payment-container">
      <h3 className="payment-title">Recargar con Tarjeta</h3>
      
      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}
      
      {success && (
        <div className="alert alert-success" role="alert">
          ¡Pago completado con éxito! Su saldo ha sido actualizado.
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group mb-3">
          <label htmlFor="amount">Monto a recargar ($)</label>
          <input
            type="number"
            id="amount"
            className="form-control"
            placeholder="100"
            value={amount}
            onChange={handleAmountChange}
            min="10"
            step="10"
            required
            disabled={loading}
          />
          <small className="form-text text-muted">Monto mínimo: $10</small>
        </div>
        
        <div className="form-group mb-3">
          <label>Información de tarjeta</label>
          <div className="stripe-card-element">
            <CardElement
              options={{
                style: {
                  base: {
                    fontSize: '16px',
                    color: '#424770',
                    '::placeholder': {
                      color: '#aab7c4',
                    },
                  },
                  invalid: {
                    color: '#9e2146',
                  },
                },
                hidePostalCode: true
              }}
            />
          </div>
        </div>
        
        <button
          type="submit"
          className="btn btn-primary w-100"
          disabled={!stripe || loading}
        >
          {loading ? 'Procesando...' : 'Pagar y Recargar'}
        </button>
      </form>
    </div>
  );
};

export default StripePayment;