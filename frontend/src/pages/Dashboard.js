// src/pages/DashboardPage.js

import React from 'react';
import useDataFetcher from '../hooks/useDataFetcher';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { format } from 'date-fns';
import { FaPhoneAlt, FaAddressBook, FaWallet, FaChartLine, FaSync } from 'react-icons/fa';
import { Dashboard as DashboardService } from '../services/apiService';

const DashboardPage = () => {
  const { user } = useAuth();
  
  const { 
    data: dashboardData, 
    loading, 
    error,
    refreshData,
    lastUpdated
  } = useDataFetcher(DashboardService.getData, 60000);
  
  const [isRefreshing, setIsRefreshing] = React.useState(false);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await refreshData();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="flex items-center">
          {lastUpdated && (
            <span className="text-sm text-gray-500 mr-3">
              Última actualización: {format(new Date(lastUpdated), 'HH:mm:ss')}
            </span>
          )}
          <button 
            onClick={handleManualRefresh}
            disabled={loading || isRefreshing}
            className={`flex items-center bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded
              ${(loading || isRefreshing) ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            <FaSync className={`mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Actualizar
          </button>
        </div>
      </div>

      {loading && !dashboardData && (
        <div className="text-center py-6">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-2">Cargando información del dashboard...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
          <p>{error}</p>
          <button 
            onClick={refreshData}
            className="text-red-700 underline mt-2"
          >
            Intentar nuevamente
          </button>
        </div>
      )}

      {/* Tarjetas de resumen */}
      {dashboardData && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 text-blue-500 mr-4">
                <FaPhoneAlt className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Campañas activas</p>
                <p className="text-xl font-semibold">{dashboardData.activeCampaigns}</p>
              </div>
            </div>
            <div className="mt-4">
              <Link to="/campaigns" className="text-blue-500 text-sm hover:underline">
                Ver todas las campañas
              </Link>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 text-green-500 mr-4">
                <FaAddressBook className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Contactos totales</p>
                <p className="text-xl font-semibold">{dashboardData.totalLeads}</p>
              </div>
            </div>
            <div className="mt-4">
              <Link to="/leads" className="text-blue-500 text-sm hover:underline">
                Ver todos los contactos
              </Link>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-100 text-yellow-500 mr-4">
                <FaChartLine className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Tasa de contacto</p>
                <p className="text-xl font-semibold">{`${dashboardData.contactRate}%`}</p>
              </div>
            </div>
            <div className="mt-4">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-yellow-500 h-2 rounded-full" 
                  style={{ width: `${dashboardData.contactRate}%` }}
                ></div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100 text-purple-500 mr-4">
                <FaWallet className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Saldo disponible</p>
                <p className="text-xl font-semibold">${dashboardData.availableBalance.toFixed(2)}</p>
              </div>
            </div>
            <div className="mt-4">
              <Link to="/balance" className="text-blue-500 text-sm hover:underline">
                Gestionar saldo
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Actividad reciente y campañas activas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Campañas activas */}
        {dashboardData && (
          <div className="bg-white rounded-lg shadow">
            <div className="border-b border-gray-200 px-6 py-4">
              <h2 className="text-lg font-medium">Campañas activas</h2>
            </div>
            <div className="px-6 py-4">
              {dashboardData.recentCampaigns && dashboardData.recentCampaigns.length > 0 ? (
                <div className="divide-y divide-gray-200">
                  {dashboardData.recentCampaigns.map(campaign => (
                    <div key={campaign._id} className="py-3 flex justify-between items-center">
                      <div>
                        <h3 className="text-sm font-medium">{campaign.name}</h3>
                        <div className="flex items-center mt-1">
                          <span className={`w-2 h-2 rounded-full mr-2 ${
                            campaign.status === 'active' ? 'bg-green-500' : 
                            campaign.status === 'paused' ? 'bg-yellow-500' : 'bg-red-500'
                          }`}></span>
                          <span className="text-xs text-gray-500 capitalize">
                            {campaign.status === 'active' ? 'Activa' : 
                            campaign.status === 'paused' ? 'Pausada' : campaign.status}
                          </span>
                        </div>
                      </div>
                      <div className="text-sm text-gray-500">
                        {campaign.progress}% completado
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No hay campañas activas</p>
              )}
              <div className="mt-4">
                <Link 
                  to="/campaigns" 
                  className="w-full block text-center py-2 bg-gray-100 hover:bg-gray-200 rounded text-gray-700 text-sm"
                >
                  Ver todas las campañas
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Actividad reciente */}
        {dashboardData && (
          <div className="bg-white rounded-lg shadow">
            <div className="border-b border-gray-200 px-6 py-4">
              <h2 className="text-lg font-medium">Actividad reciente</h2>
            </div>
            <div className="px-6 py-4">
              {dashboardData.recentActivity && dashboardData.recentActivity.length > 0 ? (
                <div className="divide-y divide-gray-200">
                  {dashboardData.recentActivity.map(activity => (
                    <div key={activity._id} className="py-3">
                      <div className="flex items-center">
                        <div className={`p-2 rounded-full mr-3 ${
                          activity.type === 'campaign' ? 'bg-blue-100 text-blue-500' :
                          activity.type === 'lead' ? 'bg-green-100 text-green-500' :
                          activity.type === 'payment' ? 'bg-purple-100 text-purple-500' :
                          'bg-gray-100 text-gray-500'
                        }`}>
                          {activity.type === 'campaign' ? <FaPhoneAlt className="h-4 w-4" /> :
                           activity.type === 'lead' ? <FaAddressBook className="h-4 w-4" /> :
                           activity.type === 'payment' ? <FaWallet className="h-4 w-4" /> :
                           <FaChartLine className="h-4 w-4" />}
                        </div>
                        <div>
                          <p className="text-sm">{activity.description}</p>
                          <p className="text-xs text-gray-500">{format(new Date(activity.date), 'dd/MM/yyyy HH:mm')}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No hay actividad reciente</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Panel de administrador */}
      {user && user.role === 'admin' && dashboardData && dashboardData.adminStats && (
        <div className="mt-8">
          <div className="mb-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold mb-2">Panel de administrador</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg text-gray-500 mb-2">Ingresos totales</h3>
              <div className="text-3xl font-bold">${dashboardData.adminStats.totalRevenue.toFixed(2)}</div>
              <div className="mt-2 text-sm text-gray-500">
                Mes actual: ${dashboardData.adminStats.currentMonthRevenue.toFixed(2)}
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg text-gray-500 mb-2">Costo operativo</h3>
              <div className="text-3xl font-bold">${dashboardData.adminStats.operationalCost.toFixed(2)}</div>
              <div className="mt-2 text-sm text-gray-500">
                Mes actual: ${dashboardData.adminStats.currentMonthCost.toFixed(2)}
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg text-gray-500 mb-2">Usuarios activos</h3>
              <div className="text-3xl font-bold">{dashboardData.adminStats.activeUsers}</div>
              <div className="mt-2 text-sm text-gray-500">
                Nuevos este mes: {dashboardData.adminStats.newUsers}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;