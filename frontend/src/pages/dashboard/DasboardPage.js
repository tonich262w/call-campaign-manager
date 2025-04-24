import React, { useState, useEffect } from 'react';

const DashboardPage = () => {
  const [stats, setStats] = useState({
    activeCampaigns: 0,
    totalCampaigns: 0,
    pendingCalls: 0,
    completedCalls: 0,
  });

  // Simular carga de datos
  useEffect(() => {
    // Aquí harías una llamada a la API en un caso real
    setStats({
      activeCampaigns: 2,
      totalCampaigns: 3,
      pendingCalls: 157,
      completedCalls: 243,
    });
  }, []);

  return (
    <div className="dashboard">
      <h1 className="text-2xl font-semibold mb-6">Panel de Control</h1>
      
      <div className="dashboard-cards">
        <div className="dashboard-card">
          <h3>Campañas</h3>
          <p className="card-value">{stats.activeCampaigns}</p>
          <p>Campañas activas</p>
          <p className="text-sm text-gray-500">{stats.totalCampaigns} campañas en total</p>
        </div>
        
        <div className="dashboard-card">
          <h3>Llamadas Pendientes</h3>
          <p className="card-value">{stats.pendingCalls}</p>
          <p>Por realizar</p>
        </div>
        
        <div className="dashboard-card">
          <h3>Llamadas Completadas</h3>
          <p className="card-value">{stats.completedCalls}</p>
          <p>Total realizado</p>
          <p className="text-sm text-gray-500">
            {Math.round((stats.completedCalls / (stats.completedCalls + stats.pendingCalls)) * 100)}% completado
          </p>
        </div>
      </div>
      
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Campañas Recientes</h2>
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Progreso</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">Campaña Ventas Q1</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                    Activa
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: '59%' }}></div>
                  </div>
                  <span className="text-xs text-gray-500">59% completado</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button onClick={() => window.location.href = '/campaigns/1'} className="text-blue-600 hover:text-blue-900">
                    Ver
                  </button>
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">Seguimiento Clientes</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
                    Pausada
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: '74%' }}></div>
                  </div>
                  <span className="text-xs text-gray-500">74% completado</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button onClick={() => window.location.href = '/campaigns/2'} className="text-blue-600 hover:text-blue-900">
                    Ver
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Actividad Reciente</h2>
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="divide-y divide-gray-200">
            <div className="p-4 flex items-start">
              <div className="flex-shrink-0 bg-green-100 rounded-full p-2 mr-3">
                <svg className="h-5 w-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Llamada completada</p>
                <p className="text-sm text-gray-500">Se contactó a Juan Pérez (+1234567890)</p>
                <p className="text-xs text-gray-400 mt-1">Hoy, 10:45 AM</p>
              </div>
            </div>
            <div className="p-4 flex items-start">
              <div className="flex-shrink-0 bg-blue-100 rounded-full p-2 mr-3">
                <svg className="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Nueva campaña creada</p>
                <p className="text-sm text-gray-500">Se creó la campaña "Ventas Q2"</p>
                <p className="text-xs text-gray-400 mt-1">Hoy, 11:22 AM</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};