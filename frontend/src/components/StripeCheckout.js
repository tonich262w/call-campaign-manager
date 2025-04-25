import React, { useState, useEffect } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import axios from 'axios';
import './StripeCheckout.css';

const StripeCheckout = ({ onSuccess }) => {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  const stripe = useStripe();
  const elements = useElements();

  // Reset states cuando el componente se monta
  useEffect(() => {
    setError(null);
    setSuccess(false);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!stripe || !elements) {
      // Stripe no ha cargado aún
      return;
    }
    
    // Validación del monto
    const amountValue = parseFloat(amount);
    if (!amount || isNaN(amountValue) || amountValue <= 0) {
      setError('Por favor, ingrese un monto válido');
      return;
    }
    
    if (amountValue < 10) {
      setError('El monto mínimo de recarga es $10.00');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // 1. Crear un PaymentIntent en el servidor
      const paymentIntentRes = await axios.post('/api/stripe/create-payment-intent', {
        amount: amountValue
      });
      
      // 2. Confirmar el pago con Stripe.js
      const cardElement = elements.getElement(CardElement);
      
      const paymentResult = await stripe.confirmCardPayment(paymentIntentRes.data.clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {}
        }
      });
      
      if (paymentResult.error) {
        throw new Error(paymentResult.error.message);
      } 
      
      if (paymentResult.paymentIntent.status === 'succeeded') {
        // 3. Confirmar la recarga en nuestro servidor
        const rechargeRes = await axios.post('/api/stripe/confirm-recharge', {
          paymentIntentId: paymentResult.paymentIntent.id
        });
        
        if (rechargeRes.data.success) {
          setSuccess(true);
          setAmount('');
          
          // Limpiar el campo de tarjeta
          cardElement.clear();
          
          // Notificar al componente padre
          if (onSuccess) {
            onSuccess(amountValue);
          }
        } else {
          throw new Error('Error al procesar la recarga');
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
    <div className="stripe-checkout-container">
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
      
      <form onSubmit={handleSubmit} className="stripe-checkout-form">
        <div className="form-group mb-3">
          <label htmlFor="amount">Monto a recargar ($)</label>
          <input
            type="number"
            id="amount"
            className="form-control"
            placeholder="100"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            min="10"
            step="1"
            required
            disabled={loading || success}
          />
          <small className="form-text text-muted">Monto mínimo: $10.00</small>
        </div>
        
        <div className="form-group mb-3">
          <label>Información de la tarjeta</label>
          <div className="card-element-container">
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
              disabled={loading || success}
            />
          </div>
        </div>
        
        <button
          type="submit"
          className="btn btn-primary"
          disabled={!stripe || loading || success}
        >
          {loading ? 'Procesando...' : 'Pagar y recargar'}
        </button>
        
        {success && (
          <button
            type="button"
            className="btn btn-outline-primary mt-2"
            onClick={() => {
              setSuccess(false);
              setError(null);
            }}
          >
            Realizar otra recarga
          </button>
        )}
      </form>
    </div>
  );
};

export default StripeCheckout;