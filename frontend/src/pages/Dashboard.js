import React, { useState, useEffect } from 'react';

const Dashboard = () => {
  const [stats, setStats] = useState({
    activeCampaigns: 0,
    totalCalls: 0,
    successRate: 0,
    balance: 0
  });
  
  const [recentCampaigns, setRecentCampaigns] = useState([]);
  
  // Simula la carga de datos
  useEffect(() => {
    // Ejemplo de datos - reemplaza con llamadas a tu API
    setStats({
      activeCampaigns: 3,
      totalCalls: 1250,
      successRate: 76,
      balance: 348.50
    });
    
    setRecentCampaigns([
      { id: 1, name: 'Campaña Primavera', status: 'active', calls: 450, success: 320 },
      { id: 2, name: 'Promoción Verano', status: 'paused', calls: 320, success: 250 },
      { id: 3, name: 'Encuesta Satisfacción', status: 'active', calls: 480, success: 390 }
    ]);
  }, []);
  
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      
      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-gray-500 text-sm font-medium">Campañas Activas</h3>
          <p className="text-3xl font-bold text-gray-900">{stats.activeCampaigns}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-gray-500 text-sm font-medium">Total Llamadas</h3>
          <p className="text-3xl font-bold text-gray-900">{stats.totalCalls}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-gray-500 text-sm font-medium">Ratio de Éxito</h3>
          <p className="text-3xl font-bold text-gray-900">{stats.successRate}%</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-gray-500 text-sm font-medium">Saldo Disponible</h3>
          <p className="text-3xl font-bold text-gray-900">€{stats.balance.toFixed(2)}</p>
          <a 
            href="/recharge" 
            className="text-sm text-blue-600 hover:text-blue-800 mt-2 inline-block"
          >
            Recargar saldo
          </a>
        </div>
      </div>
      
      {/* Recent campaigns */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Campañas Recientes</h2>
          <a 
            href="/campaigns" 
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            Ver todas
          </a>
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
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      campaign.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
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
                    <a href={`/campaigns/${campaign.id}`} className="text-blue-600 hover:text-blue-900 mr-4">
                      Ver
                    </a>
                    <a href={`/campaigns/${campaign.id}/edit`} className="text-indigo-600 hover:text-indigo-900">
                      Editar
                    </a>
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

export default Dashboard;
