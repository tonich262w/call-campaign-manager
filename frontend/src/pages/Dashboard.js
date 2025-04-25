import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { balanceService, campaignService } from '../services/callService';

const ImprovedDashboard = () => {
  const [stats, setStats] = useState({
    activeCampaigns: 0,
    totalCalls: 0,
    successRate: 0,
    balance: 0
  });
  
  const [recentCampaigns, setRecentCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    // Function to load dashboard data
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        
        // In a real app, these would be API calls using the service functions
        // For now, we'll simulate with a timeout
        
        setTimeout(() => {
          // Mock data - replace with actual API calls in production
          setStats({
            activeCampaigns: 3,
            totalCalls: 1250,
            successRate: 76,
            balance: 348.50
          });
          
          setRecentCampaigns([
            { id: 1, name: 'Campaña Ventas Q1', status: 'active', calls: 450, success: 320 },
            { id: 2, name: 'Promoción Verano', status: 'paused', calls: 320, success: 250 },
            { id: 3, name: 'Encuesta Satisfacción', status: 'active', calls: 480, success: 390 }
          ]);
          
          setLoading(false);
        }, 1000);
        
        // In production, use these service calls:
        /*
        // Get active campaigns
        const campaigns = await campaignService.getAll();
        const activeCampaigns = campaigns.filter(c => c.status === 'active');
        
        // Get balance
        const balanceData = await balanceService.getBalance();
        
        // Get call statistics (would need a separate API endpoint)
        const callStats = await campaignService.getTotalCallStats();
        
        setStats({
          activeCampaigns: activeCampaigns.length,
          totalCalls: callStats.totalCalls,
          successRate: callStats.successRate,
          balance: balanceData.currentBalance
        });
        
        // Get recent campaigns
        setRecentCampaigns(campaigns.slice(0, 3));
        */
      } catch (err) {
        console.error("Error loading dashboard data:", err);
        setError("No se pudieron cargar los datos del dashboard. Por favor, intente nuevamente.");
        setLoading(false);
      }
    };
    
    loadDashboardData();
  }, []);
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Error:</strong>
        <span className="block sm:inline"> {error}</span>
      </div>
    );
  }
  
  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">Panel de Control</h1>
      
      {/* Stats cards */}
      <div className="dashboard-cards">
        <div className="dashboard-card">
          <h3>Campañas Activas</h3>
          <p className="card-value">{stats.activeCampaigns}</p>
          <p className="text-gray-500">Campañas en curso</p>
          <Link 
            to="/campaigns" 
            className="text-sm text-blue-600 hover:text-blue-800 mt-2 inline-block"
          >
            Ver campañas
          </Link>
        </div>
        
        <div className="dashboard-card">
          <h3>Total Llamadas</h3>
          <p className="card-value">{stats.totalCalls}</p>
          <p className="text-gray-500">Llamadas realizadas</p>
        </div>
        
        <div className="dashboard-card">
          <h3>Ratio de Éxito</h3>
          <p className="card-value">{stats.successRate}%</p>
          <p className="text-gray-500">Porcentaje de llamadas completadas</p>
        </div>
        
        <div className="dashboard-card">
          <h3>Saldo Disponible</h3>
          <p className="card-value">${stats.balance.toFixed(2)}</p>
          <p className="text-gray-500">Para realizar llamadas</p>
          <Link 
            to="/balance" 
            className="text-sm text-blue-600 hover:text-blue-800 mt-2 inline-block"
          >
            Recargar saldo
          </Link>
        </div>
      </div>
      
      {/* Recent campaigns */}
      <div className="bg-white rounded-lg shadow-sm p-6 mt-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-800">Campañas Recientes</h2>
          <Link 
            to="/campaigns" 
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            Ver todas
          </Link>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nombre
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Llamadas
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Éxito
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentCampaigns.map(campaign => (
                <tr key={campaign.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{campaign.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`badge ${
                      campaign.status === 'active' 
                        ? 'badge-green' 
                        : 'badge-yellow'
                    }`}>
                      {campaign.status === 'active' ? 'Activa' : 'Pausada'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                    {campaign.calls}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                    {campaign.success} ({Math.round(campaign.success / campaign.calls * 100)}%)
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link to={`/campaigns/${campaign.id}`} className="text-blue-600 hover:text-blue-900 mr-4">
                      Ver
                    </Link>
                    <Link to={`/campaigns/${campaign.id}/edit`} className="text-indigo-600 hover:text-indigo-900">
                      Editar
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Quick actions */}
      <div className="bg-white rounded-lg shadow-sm p-6 mt-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Acciones Rápidas</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link 
            to="/campaigns/new" 
            className="p-4 bg-indigo-50 rounded-lg flex items-center transition-all hover:bg-indigo-100"
          >
            <div className="bg-indigo-100 p-3 rounded-full mr-4">
              <i className="fas fa-plus text-indigo-600"></i>
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Nueva Campaña</h3>
              <p className="text-sm text-gray-500">Crear una campaña de llamadas</p>
            </div>
          </Link>
          
          <Link 
            to="/leads/import" 
            className="p-4 bg-green-50 rounded-lg flex items-center transition-all hover:bg-green-100"
          >
            <div className="bg-green-100 p-3 rounded-full mr-4">
              <i className="fas fa-upload text-green-600"></i>
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Importar Contactos</h3>
              <p className="text-sm text-gray-500">Añadir nuevos contactos</p>
            </div>
          </Link>
          
          <Link 
            to="/reports" 
            className="p-4 bg-blue-50 rounded-lg flex items-center transition-all hover:bg-blue-100"
          >
            <div className="bg-blue-100 p-3 rounded-full mr-4">
              <i className="fas fa-chart-pie text-blue-600"></i>
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Ver Reportes</h3>
              <p className="text-sm text-gray-500">Analizar rendimiento</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ImprovedDashboard;