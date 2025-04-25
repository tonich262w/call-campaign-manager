import React, { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import './StripePayment.css';

const StripePayment = ({ onSuccess }) => {
  const [amount, setAmount] = useState('');
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
    
    const amountValue = parseFloat(amount);
    if (amountValue < 10) {
      setError('El monto mínimo de recarga es $10.00');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Para la demostración, simulamos el proceso de Stripe
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Simulamos un pago exitoso
      setSuccess(true);
      
      // Notificar al componente padre
      if (onSuccess) {
        onSuccess(amountValue);
      }
      
      // Limpiar el formulario
      setAmount('');
      
      // En un escenario real, realizaríamos estos pasos:
      // 1. Crear un Payment Intent en el servidor
      // 2. Usar stripe.confirmCardPayment con el cardElement
      // 3. Confirmar la recarga en nuestro backend
      
    } catch (err) {
      console.error('Error al procesar el pago:', err);
      setError(err.message || 'Ha ocurrido un error al procesar el pago');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="stripe-payment-container">
      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}
      
      {success ? (
        <div className="text-center">
          <div className="alert alert-success mb-4" role="alert">
            ¡Pago completado con éxito! Su saldo ha sido actualizado.
          </div>
          <button 
            className="btn btn-outline-primary" 
            onClick={() => {
              setSuccess(false);
              setError(null);
            }}
          >
            Realizar otra recarga
          </button>
        </div>
      ) : (
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
              step="1"
              required
              disabled={loading}
            />
            <small className="form-text text-muted">Monto mínimo: $10</small>
          </div>
          
          <div className="form-group mb-3">
            <label>Información de tarjeta</label>
            <div className="card-element-container p-3 border rounded">
              {/* Componente CardElement de Stripe */}
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
      )}
    </div>
  );
};

export default StripePayment;