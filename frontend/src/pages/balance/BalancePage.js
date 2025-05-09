import React, { useState, useEffect } from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import StripePayment from '../components/StripePayment';
import axios from 'axios';

// Cargar Stripe con tu clave pública
const stripePromise = loadStripe('tu_clave_publica_de_stripe');

// Componente para balance y saldo con integración de Stripe
const StripeBalancePage = () => {
  const [balance, setBalance] = useState({
    currentBalance: 250.00,
    totalSpent: 750.00,
    callRate: 0.05, // $0.05 por llamada
    callMinuteRate: 0.02 // $0.02 por minuto adicional
  });
  
  const [transactions, setTransactions] = useState([
    {
      id: 1,
      date: '2025-03-15',
      type: 'charge',
      amount: 200.00,
      description: 'Recarga de saldo',
      status: 'completed'
    },
    {
      id: 2,
      date: '2025-03-17',
      type: 'expense',
      amount: 75.00,
      description: 'Consumo Campaña "Ventas Q1"',
      campaignId: 1,
      status: 'completed'
    },
    {
      id: 3,
      date: '2025-04-01',
      type: 'charge',
      amount: 150.00,
      description: 'Recarga de saldo',
      status: 'completed'
    },
    {
      id: 4,
      date: '2025-04-10',
      type: 'expense',
      amount: 25.00,
      description: 'Consumo Campaña "Seguimiento Clientes"',
      campaignId: 2,
      status: 'completed'
    }
  ]);
  
  const [campaignCosts, setCampaignCosts] = useState([
    {
      id: 1,
      name: 'Campaña Ventas Q1',
      calls: 208,
      totalMinutes: 785,
      cost: 75.00,
      status: 'active'
    },
    {
      id: 2,
      name: 'Seguimiento Clientes',
      calls: 89,
      totalMinutes: 267,
      cost: 25.00,
      status: 'paused'
    }
  ]);
  
  // Estado para control de pestaña activa (transferencia manual o Stripe)
  const [activeTab, setActiveTab] = useState('manual');
  
  const [rechargeAmount, setRechargeAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // Función para manejar la recarga manual
  const handleManualRecharge = async (e) => {
    e.preventDefault();
    
    if (!rechargeAmount || isNaN(rechargeAmount) || parseFloat(rechargeAmount) <= 0) {
      setError('Por favor, ingrese un monto válido');
      return;
    }
    
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      // Simulamos la llamada a la API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const amount = parseFloat(rechargeAmount);
      
      // Actualizar saldo
      setBalance(prev => ({
        ...prev,
        currentBalance: prev.currentBalance + amount
      }));
      
      // Añadir nueva transacción
      const newTransaction = {
        id: transactions.length + 1,
        date: new Date().toISOString().split('T')[0],
        type: 'charge',
        amount: amount,
        description: 'Recarga de saldo (transferencia)',
        status: 'completed'
      };
      
      setTransactions([newTransaction, ...transactions]);
      
      setSuccess(`Recarga de $${amount.toFixed(2)} realizada con éxito`);
      setRechargeAmount('');
    } catch (err) {
      console.error('Error al realizar la recarga:', err);
      setError('No se pudo completar la recarga. Por favor, intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };
  
  // Función que se ejecuta después de una recarga exitosa con Stripe
  const handleStripeSuccess = (amount) => {
    // Actualizar saldo
    setBalance(prev => ({
      ...prev,
      currentBalance: prev.currentBalance + amount
    }));
    
    // Añadir nueva transacción
    const newTransaction = {
      id: transactions.length + 1,
      date: new Date().toISOString().split('T')[0],
      type: 'charge',
      amount: amount,
      description: 'Recarga de saldo (Stripe)',
      status: 'completed'
    };
    
    setTransactions([newTransaction, ...transactions]);
  };
  
  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">Gestión de Saldo</h1>
      
      {/* Resumen de saldo */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Saldo Disponible</h2>
            <div className="flex items-end">
              <span className="text-4xl font-bold text-blue-600">${balance.currentBalance.toFixed(2)}</span>
            </div>
            <p className="text-gray-500 mt-2">
              Has gastado un total de ${balance.totalSpent.toFixed(2)} en llamadas
            </p>
          </div>
          
          <div className="bg-gray-50 px-6 py-4">
            <h3 className="text-sm font-medium text-gray-500 uppercase">Tarifas actuales</h3>
            <div className="mt-2 space-y-1">
              <p className="text-sm text-gray-600">
                <span className="font-medium">Llamada:</span> ${balance.callRate.toFixed(2)} por llamada
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Minuto adicional:</span> ${balance.callMinuteRate.toFixed(2)} por minuto
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Recargar Saldo</h2>
            
            {/* Pestañas para métodos de pago */}
            <ul className="nav nav-tabs mb-4">
              <li className="nav-item">
                <button 
                  className={`nav-link ${activeTab === 'manual' ? 'active' : ''}`}
                  onClick={() => setActiveTab('manual')}
                >
                  Transferencia Manual
                </button>
              </li>
              <li className="nav-item">
                <button 
                  className={`nav-link ${activeTab === 'stripe' ? 'active' : ''}`}
                  onClick={() => setActiveTab('stripe')}
                >
                  Pago con Tarjeta
                </button>
              </li>
            </ul>
            
            {/* Contenido de pestaña activa */}
            <div className="tab-content">
              {/* Pestaña 1: Recarga manual */}
              {activeTab === 'manual' && (
                <div>
                  {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                      <span className="block sm:inline">{error}</span>
                    </div>
                  )}
                  
                  {success && (
                    <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
                      <span className="block sm:inline">{success}</span>
                    </div>
                  )}
                  
                  <form onSubmit={handleManualRecharge}>
                    <div className="mb-4">
                      <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="amount">
                        Monto a recargar ($)
                      </label>
                      <input
                        id="amount"
                        type="number"
                        min="10"
                        step="10"
                        placeholder="100"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        value={rechargeAmount}
                        onChange={(e) => setRechargeAmount(e.target.value)}
                        required
                      />
                      <p className="text-sm text-gray-500 mt-1">
                        Monto mínimo: $10.00
                      </p>
                    </div>
                    
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={loading}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-blue-300"
                      >
                        {loading ? 'Procesando...' : 'Recargar Ahora'}
                      </button>
                    </div>
                  </form>
                  
                  <div className="mt-4 p-3 bg-blue-50 rounded-md">
                    <p className="text-sm text-blue-700">
                      <strong>Instrucciones:</strong> Realice una transferencia al banco XXXX cuenta #XXXX. 
                      Envíe el comprobante a soporte@ejemplo.com indicando su ID de usuario.
                    </p>
                  </div>
                </div>
              )}
              
              {/* Pestaña 2: Recarga con Stripe */}
              {activeTab === 'stripe' && (
                <Elements stripe={stripePromise}>
                  <StripePayment onSuccess={handleStripeSuccess} />
                </Elements>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Historial de transacciones */}
      <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">Historial de Transacciones</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tipo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Monto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Descripción
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {transactions.map((transaction) => (
                <tr key={transaction.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(transaction.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      transaction.type === 'charge' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {transaction.type === 'charge' ? 'Recarga' : 'Consumo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    ${transaction.amount.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {transaction.description}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                      {transaction.status === 'completed' ? 'Completado' : 'Pendiente'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Desglose por campaña */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">Consumo por Campaña</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Campaña
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Llamadas
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Minutos
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Costo
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {campaignCosts.map((campaign) => (
                <tr key={campaign.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {campaign.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      campaign.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {campaign.status === 'active' ? 'Activa' : 'Pausada'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {campaign.calls}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {campaign.totalMinutes}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    ${campaign.cost.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StripeBalancePage;