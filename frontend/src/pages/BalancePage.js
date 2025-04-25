import React, { useState, useEffect } from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import StripeCheckout from '../components/StripeCheckout';
import axios from 'axios';
import './BalancePage.css';

// Carga Stripe con la clave pública
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

const BalancePage = () => {
  const [balance, setBalance] = useState({
    currentBalance: 0,
    totalSpent: 0,
    callRate: 0.05,
    callMinuteRate: 0.02
  });
  
  const [transactions, setTransactions] = useState([]);
  const [campaignCosts, setCampaignCosts] = useState([]);
  const [activeTab, setActiveTab] = useState('manual');
  const [rechargeAmount, setRechargeAmount] = useState('');
  const [loading, setLoading] = useState(true);
  const [rechargeLoading, setRechargeLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // Cargar datos de balance del usuario
  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const res = await axios.get('/api/balance');
        setBalance(res.data);
        setLoading(false);
      } catch (err) {
        console.error('Error al cargar el balance:', err);
        setError('Error al cargar los datos de saldo');
        setLoading(false);
      }
    };
    
    const fetchTransactions = async () => {
      try {
        const res = await axios.get('/api/balance/transactions');
        setTransactions(res.data);
      } catch (err) {
        console.error('Error al cargar transacciones:', err);
      }
    };
    
    const fetchCampaignCosts = async () => {
      try {
        const res = await axios.get('/api/balance/campaign-costs');
        setCampaignCosts(res.data);
      } catch (err) {
        console.error('Error al cargar costos por campaña:', err);
      }
    };
    
    fetchBalance();
    fetchTransactions();
    fetchCampaignCosts();
  }, []);
  
  // Manejar recarga manual
  const handleManualRecharge = async (e) => {
    e.preventDefault();
    
    if (!rechargeAmount || isNaN(rechargeAmount) || parseFloat(rechargeAmount) <= 0) {
      setError('Por favor, ingrese un monto válido');
      return;
    }
    
    const amount = parseFloat(rechargeAmount);
    
    if (amount < 10) {
      setError('El monto mínimo de recarga es $10.00');
      return;
    }
    
    setRechargeLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      // Registrar solicitud de recarga manual
      const res = await axios.post('/api/balance/request-manual-recharge', {
        amount,
        notes: 'Solicitud de recarga manual'
      });
      
      setSuccess(res.data.message || 'Solicitud de recarga enviada con éxito');
      setRechargeAmount('');
    } catch (err) {
      console.error('Error al solicitar recarga:', err);
      setError(err.response?.data?.message || 'Error al procesar la solicitud de recarga');
    } finally {
      setRechargeLoading(false);
    }
  };
  
  // Manejar recarga exitosa con Stripe
  const handleStripeSuccess = async (amount) => {
    try {
      // Refrescar el balance
      const res = await axios.get('/api/balance');
      setBalance(res.data);
      
      // Refrescar transacciones
      const transRes = await axios.get('/api/balance/transactions');
      setTransactions(transRes.data);
      
      // Mostrar mensaje de éxito
      setSuccess(`Recarga de $${amount.toFixed(2)} realizada con éxito`);
    } catch (err) {
      console.error('Error al actualizar datos después de la recarga:', err);
    }
  };
  
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    );
  }
  
  return (
    <div className="balance-page-container">
      <h1 className="page-title">Gestión de Saldo</h1>
      
      {/* Resumen del balance */}
      <div className="row mb-4">
        <div className="col-md-6">
          <div className="card h-100">
            <div className="card-body">
              <h2 className="card-title">Saldo Disponible</h2>
              <div className="balance-amount">${balance.currentBalance.toFixed(2)}</div>
              <p className="text-muted">
                Has gastado un total de ${balance.totalSpent.toFixed(2)} en llamadas
              </p>
            </div>
            <div className="card-footer bg-light">
              <h3 className="rates-title">Tarifas actuales</h3>
              <div className="rates-info">
                <div className="rate-item">
                  <span className="rate-label">Llamada:</span>
                  <span className="rate-value">${balance.callRate.toFixed(2)} por llamada</span>
                </div>
                <div className="rate-item">
                  <span className="rate-label">Minuto adicional:</span>
                  <span className="rate-value">${balance.callMinuteRate.toFixed(2)} por minuto</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="col-md-6">
          <div className="card h-100">
            <div className="card-body">
              <h2 className="card-title">Recargar Saldo</h2>
              
              {/* Pestañas para métodos de pago */}
              <ul className="nav nav-tabs mb-3">
                <li className="nav-item">
                  <a 
                    className={`nav-link ${activeTab === 'manual' ? 'active' : ''}`}
                    href="#!"
                    onClick={(e) => {
                      e.preventDefault();
                      setActiveTab('manual');
                      setError(null);
                      setSuccess(null);
                    }}
                  >
                    Transferencia Manual
                  </a>
                </li>
                <li className="nav-item">
                  <a 
                    className={`nav-link ${activeTab === 'stripe' ? 'active' : ''}`}
                    href="#!"
                    onClick={(e) => {
                      e.preventDefault();
                      setActiveTab('stripe');
                      setError(null);
                      setSuccess(null);
                    }}
                  >
                    Pago con Tarjeta
                  </a>
                </li>
              </ul>
              
              {/* Alertas de error y éxito */}
              {error && (
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
              )}
              
              {success && (
                <div className="alert alert-success" role="alert">
                  {success}
                </div>
              )}
              
              {/* Contenido de pestañas */}
              <div className="tab-content">
                {/* Pestaña de recarga manual */}
                {activeTab === 'manual' && (
                  <div>
                    <form onSubmit={handleManualRecharge}>
                      <div className="mb-3">
                        <label htmlFor="manualAmount" className="form-label">Monto a recargar ($)</label>
                        <input
                          type="number"
                          className="form-control"
                          id="manualAmount"
                          min="10"
                          step="1"
                          placeholder="100"
                          value={rechargeAmount}
                          onChange={(e) => setRechargeAmount(e.target.value)}
                          required
                        />
                        <div className="form-text">Monto mínimo: $10.00</div>
                      </div>
                      
                      <button 
                        type="submit" 
                        className="btn btn-primary"
                        disabled={rechargeLoading}
                      >
                        {rechargeLoading ? 'Procesando...' : 'Solicitar Recarga'}
                      </button>
                    </form>
                    
                    <div className="manual-instructions mt-3">
                      <h4>Instrucciones para transferencia:</h4>
                      <p>
                        1. Realice una transferencia bancaria a:<br />
                        <strong>Banco:</strong> [NOMBRE DEL BANCO]<br />
                        <strong>Cuenta:</strong> [NÚMERO DE CUENTA]<br />
                        <strong>Titular:</strong> [NOMBRE DE LA EMPRESA]
                      </p>
                      <p>
                        2. Envíe el comprobante de pago a <strong>pagos@ejemplo.com</strong> indicando
                        su ID de usuario.
                      </p>
                      <p>
                        3. Una vez verificado el pago, su saldo será actualizado en un plazo de 24 horas hábiles.
                      </p>
                    </div>
                  </div>
                )}
                
                {/* Pestaña de recarga con Stripe */}
                {activeTab === 'stripe' && (
                  <Elements stripe={stripePromise}>
                    <StripeCheckout onSuccess={handleStripeSuccess} />
                  </Elements>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Historial de transacciones */}
      <div className="card mb-4">
        <div className="card-header">
          <h2 className="card-title mb-0">Historial de Transacciones</h2>
        </div>
        <div className="card-body p-0">
          {transactions.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-muted">No hay transacciones para mostrar</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Tipo</th>
                    <th>Monto</th>
                    <th>Descripción</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((transaction) => (
                    <tr key={transaction._id}>
                      <td>{new Date(transaction.createdAt).toLocaleDateString()}</td>
                      <td>
                        <span className={`badge ${transaction.type === 'recharge' ? 'bg-success' : 'bg-danger'}`}>
                          {transaction.type === 'recharge' ? 'Recarga' : 'Consumo'}
                        </span>
                      </td>
                      <td>${transaction.amount.toFixed(2)}</td>
                      <td>{transaction.description}</td>
                      <td>
                        <span className={`badge bg-${
                          transaction.status === 'completed' ? 'primary' : 
                          transaction.status === 'pending' ? 'warning' : 'secondary'
                        }`}>
                          {transaction.status === 'completed' ? 'Completado' : 
                           transaction.status === 'pending' ? 'Pendiente' : transaction.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      
      {/* Desglose por campaña */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title mb-0">Consumo por Campaña</h2>
        </div>
        <div className="card-body p-0">
          {campaignCosts.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-muted">No hay datos de consumo por campaña</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>Campaña</th>
                    <th>Estado</th>
                    <th>Llamadas</th>
                    <th>Minutos</th>
                    <th>Costo</th>
                  </tr>
                </thead>
                <tbody>
                  {campaignCosts.map((campaign) => (
                    <tr key={campaign._id}>
                      <td>{campaign.name}</td>
                      <td>
                        <span className={`badge ${campaign.status === 'active' ? 'bg-success' : 'bg-warning'}`}>
                          {campaign.status === 'active' ? 'Activa' : 'Pausada'}
                        </span>
                      </td>
                      <td>{campaign.calls}</td>
                      <td>{campaign.totalMinutes}</td>
                      <td>${campaign.cost.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BalancePage;