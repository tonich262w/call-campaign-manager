// src/pages/CampaignsPage.js

import React, { useState } from 'react';
import useDataFetcher from '../hooks/useDataFetcher';
import { format } from 'date-fns';
import { FaSync, FaPlus } from 'react-icons/fa';

const CampaignsPage = () => {
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
  const { 
    data: campaigns, 
    loading, 
    error, 
    refreshData,
    lastUpdated 
  } = useDataFetcher(`${API_URL}/campaigns`, 60000); // Actualiza cada minuto

  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await refreshData();
    setTimeout(() => setIsRefreshing(false), 500); // Efecto visual de actualización
  };

  const handleStatusToggle = async (campaignId, currentStatus) => {
    // Esta función se conectaría a tu API para cambiar el estado de una campaña
    // Solo es un ejemplo - tendrías que implementar la lógica real para tu API
    try {
      const token = localStorage.getItem('token');
      const newStatus = currentStatus === 'active' ? 'paused' : 'active';
      
      // Aquí iría la llamada real a tu API
      // const response = await axios.patch(`${API_URL}/campaigns/${campaignId}/status`, 
      //   { status: newStatus },
      //   { headers: { Authorization: `Bearer ${token}` } }
      // );
      
      // Después de un cambio exitoso, refrescamos los datos
      await refreshData();
    } catch (err) {
      console.error('Error al cambiar el estado de la campaña:', err);
      // Aquí podrías mostrar una notificación de error
    }
  };
  
  return (
    <div className="campaigns-container p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Campañas</h1>
        <div className="flex items-center">
          {lastUpdated && (
            <span className="text-sm text-gray-500 mr-3">
              Última actualización: {format(new Date(lastUpdated), 'HH:mm:ss')}
            </span>
          )}
          <button 
            onClick={handleManualRefresh}
            disabled={loading || isRefreshing}
            className={`flex items-center bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded mr-2
              ${(loading || isRefreshing) ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            <FaSync className={`mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Actualizar
          </button>
          <button className="flex items-center bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded">
            <FaPlus className="mr-2" />
            Nueva Campaña
          </button>
        </div>
      </div>

      {loading && !campaigns && (
        <div className="text-center py-6">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-2">Cargando campañas...</p>
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {campaigns && campaigns.map(campaign => (
          <div 
            key={campaign._id} 
            className="campaign-card bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow border border-gray-200"
          >
            <h3 className="text-xl font-semibold">{campaign.name}</h3>
            <div className="flex items-center mt-2">
              <span className={`w-3 h-3 rounded-full mr-2 ${
                campaign.status === 'active' ? 'bg-green-500' : 
                campaign.status === 'paused' ? 'bg-yellow-500' : 'bg-red-500'
              }`}></span>
              <span className="capitalize">{
                campaign.status === 'active' ? 'Activa' : 
                campaign.status === 'paused' ? 'Pausada' : 
                campaign.status === 'completed' ? 'Completada' : 
                campaign.status === 'draft' ? 'Borrador' : campaign.status
              }</span>
            </div>
            <div className="mt-3 text-sm text-gray-600">
              <p>Leads totales: {campaign.totalLeads || 0}</p>
              <p>Llamadas realizadas: {campaign.completedCalls || 0}</p>
              <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full" 
                  style={{ width: `${campaign.totalLeads ? 
                    (campaign.completedCalls / campaign.totalLeads) * 100 : 0}%` 
                  }}
                ></div>
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <button className="text-blue-500 hover:underline mr-3">
                Ver detalles
              </button>
              <button 
                className={`${
                campaign.status === 'active' ? 'text-yellow-500' : 'text-green-500'} hover:underline`}
                onClick={() => handleStatusToggle(campaign._id, campaign.status)}
                disabled={campaign.status === 'completed'}
              >
                {campaign.status === 'active' ? 'Pausar' : campaign.status === 'paused' ? 'Activar' : ''}
              </button>
            </div>
          </div>
        ))}
        
        {campaigns && campaigns.length === 0 && (
          <div className="col-span-full text-center py-10">
            <p className="text-gray-500 mb-4">No hay campañas disponibles</p>
            <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">
              Crear tu primera campaña
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CampaignsPage;