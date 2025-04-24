import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import CheckoutForm from './CheckoutForm';

const stripePromise = loadStripe('tu_clave_publica_de_stripe');

const PaymentPage = () => {
  const [amount, setAmount] = useState(50);

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Recargar Saldo</h1>
      <div className="max-w-md mx-auto mb-6">
        <label className="block mb-2">Monto a recargar:</label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
          className="w-full border px-3 py-2 rounded"
        />
      </div>
      <Elements stripe={stripePromise}>
        <CheckoutForm amount={amount} />
      </Elements>
    </div>
  );
};

export default PaymentPage;