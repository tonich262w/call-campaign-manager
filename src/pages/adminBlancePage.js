// src/pages/AdminBalancePage.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useBalance } from '../contexts/BalanceContext';
import { balanceService } from '../services/api';

const AdminBalancePage = () => {
  const { currentUser, isAdmin } = useAuth();
  const { adminBalanceDetails, getInflationFactor } = useBalance();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [balanceData, setBalanceData] = useState(null);
  
  useEffect(() => {
    // Redirigir si no es admin
    if (currentUser && !isAdmin()) {
      window.location.href = '/dashboard';
      return;
    }
    
    // Cargar datos detallados de balance
    const fetchBalanceDetails = async () => {
      try {
        setLoading(true);
        const data = await balanceService.getAdminBalanceDetails();
        setBalanceData(data);
        setError(null);
      } catch (err) {
        console.error('Error loading admin balance details:', err);
        setError('Error al cargar los detalles de balance. Por favor, intente nuevamente.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchBalanceDetails();
  }, [currentUser, isAdmin]);
  
  if (loading) {
    return (
      <div className="admin-page loading-container">
        <i className="fas fa-spinner fa-spin fa-3x"></i>
        <p>Cargando datos de balance...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="admin-page error-container">
        <i className="fas fa-exclamation-triangle fa-3x"></i>
        <p>{error}</p>
        <button className="btn btn-primary" onClick={() => window.location.reload()}>
          Reintentar
        </button>
      </div>
    );
  }
  
  // Si no hay datos, mostrar mensaje
  if (!balanceData && !adminBalanceDetails) {
    return (
      <div className="admin-page">
        <div className="card">
          <div className="card-header">
            <h2>Panel de Administración - Balance</h2>
          </div>
          <div className="card-body">
            <p>No hay datos de balance disponibles.</p>
          </div>
        </div>
      </div>
    );
  }
  
  // Usar los datos del contexto o los obtenidos directamente
  const data = balanceData || adminBalanceDetails;
  const inflationFactor = getInflationFactor();
  
  return (
    <div className="admin-page">
      <div className="card">
        <div className="card-header">
          <h2>Panel de Administración - Balance</h2>
        </div>
        <div className="card-body">
          <div className="admin-stats">
            <div className="stat-card">
              <h3>Factor de Inflación</h3>
              <p className="stat-value">{inflationFactor}x</p>
              <p className="stat-description">
                Todos los costos se multiplican por este factor
              </p>
            </div>
            
            <div className="stat-card">
              <h3>Balance Total (Inflado)</h3>
              <p className="stat-value">${data.totals.inflatedBalance.toFixed(2)}</p>
              <p className="stat-description">
                Saldo total mostrado a los usuarios
              </p>
            </div>
            
            <div className="stat-card highlight">
              <h3>Balance Total (Real)</h3>
              <p className="stat-value">${data.totals.realBalance.toFixed(2)}</p>
              <p className="stat-description">
                Saldo real disponible para llamadas
              </p>
            </div>
            
            <div className="stat-card profit">
              <h3>Margen Total</h3>
              <p className="stat-value">
                ${(data.totals.inflatedBalance - data.totals.realBalance).toFixed(2)}
              </p>
              <p className="stat-description">
                Diferencia entre balance inflado y real
              </p>
            </div>
          </div>
          
          <hr />
          
          <h3>Balances por Usuario</h3>
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>ID Usuario</th>
                  <th>Balance Mostrado</th>
                  <th>Balance Real</th>
                  <th>Margen</th>
                </tr>
              </thead>
              <tbody>
                {data.userBalances.map(userBalance => (
                  <tr key={userBalance.userId}>
                    <td>{userBalance.userId}</td>
                    <td>${userBalance.inflatedBalance.toFixed(2)}</td>
                    <td>${userBalance.realBalance.toFixed(2)}</td>
                    <td>${(userBalance.inflatedBalance - userBalance.realBalance).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminBalancePage;
