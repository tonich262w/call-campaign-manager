// src/components/StripePayment.js

import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  CardElement,
  Elements,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import axios from 'axios';
import './StripePayment.css'; // Importamos los estilos específicos

// Componente del formulario de pago
const CheckoutForm = ({ amount = 50 }) => {
  const [succeeded, setSucceeded] = useState(false);
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [disabled, setDisabled] = useState(true);
  const [clientSecret, setClientSecret] = useState('');
  
  const stripe = useStripe();
  const elements = useElements();

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    // Crear PaymentIntent tan pronto como la página cargue
    const createPaymentIntent = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.post(
          `${API_URL}/stripe/create-payment-intent`, 
          { amount: amount * 100 }, // Stripe usa centavos
          {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            }
          }
        );
        
        setClientSecret(response.data.clientSecret);
      } catch (err) {
        setError('Error al preparar el pago. Por favor, inténtelo de nuevo.');
        console.error('Error creating payment intent:', err);
      }
    };

    if (amount > 0) {
      createPaymentIntent();
    }
  }, [amount, API_URL]);

  const cardStyle = {
    style: {
      base: {
        color: '#32325d',
        fontFamily: 'Arial, sans-serif',
        fontSmoothing: 'antialiased',
        fontSize: '16px',
        '::placeholder': {
          color: '#aab7c4'
        }
      },
      invalid: {
        color: '#fa755a',
        iconColor: '#fa755a'
      }
    }
  };

  const handleChange = (event) => {
    // Escuchar cambios en CardElement
    setDisabled(event.empty);
    setError(event.error ? event.error.message : '');
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    setProcessing(true);

    if (!stripe || !elements || !clientSecret) {
      setProcessing(false);
      return;
    }

    const payload = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: elements.getElement(CardElement)
      }
    });

    if (payload.error) {
      setError(`Error de pago: ${payload.error.message}`);
      setProcessing(false);
    } else {
      setError(null);
      setProcessing(false);
      setSucceeded(true);
      
      // Aquí podríamos actualizar el saldo del usuario o navegar a otra página
      // después de un pago exitoso

      // Simulando actualización de saldo después del pago exitoso
      try {
        const token = localStorage.getItem('token');
        await axios.post(
          `${API_URL}/balance/update-after-payment`,
          { 
            amount, 
            paymentId: payload.paymentIntent.id,
            paymentType: 'stripe'
          },
          {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            }
          }
        );
      } catch (err) {
        console.error('Error updating balance after payment:', err);
      }
    }
  };

  return (
    <form id="payment-form" onSubmit={handleSubmit}>
      {/* Cuando el pago es exitoso */}
      {succeeded ? (
        <div className="payment-success bg-green-50 text-green-700 p-4 rounded mb-4">
          <p className="font-medium">¡Pago procesado correctamente!</p>
          <p>Su saldo ha sido actualizado.</p>
        </div>
      ) : (
        <>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Detalles de la tarjeta
            </label>
            <CardElement 
              id="card-element" 
              options={cardStyle} 
              onChange={handleChange} 
              className="card-element"
            />
          </div>

          <button
            disabled={processing || disabled || succeeded || !clientSecret}
            id="submit"
            className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
              processing || disabled || !clientSecret
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
          >
            <span id="button-text">
              {processing ? (
                <div className="spinner" id="spinner"></div>
              ) : (
                `Pagar $${amount}`
              )}
            </span>
          </button>
        </>
      )}

      {/* Mostrar cualquier error que ocurra al procesar el pago */}
      {error && (
        <div className="card-error text-red-500 mt-2 text-sm" role="alert">
          {error}
        </div>
      )}
    </form>
  );
};

// Promise para cargar Stripe
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY || 'pk_test_TYooMQauvdEDq54NiTphI7jx');

// Componente principal que envuelve el formulario con el contexto de Stripe
const StripePayment = ({ amount }) => {
  return (
    <div className="stripe-payment-container">
      <Elements stripe={stripePromise}>
        <CheckoutForm amount={amount} />
      </Elements>
    </div>
  );
};

export default StripePayment;