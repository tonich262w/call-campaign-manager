// src/pages/campaigns/CampaignDetail.js
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Campaign, Lead } from '../../services/apiService';

const CampaignDetail = () => {
  const [campaign, setCampaign] = useState(null);
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const { id } = useParams();
  const navigate = useNavigate();

  const loadLeads = async (pageNum = 1, append = false) => {
    try {
      if (pageNum === 1) {
        !append && setLoading(true);
      } else {
        setLoadingMore(true);
      }

      const limit = 10; // Cantidad de contactos por página
      const leadsData = await Lead.getByCampaign(id, { page: pageNum, limit });
      console.log('Contactos obtenidos (página ' + pageNum + '):', leadsData);

      // Determinar si hay más páginas disponibles
      if (leadsData && leadsData.pagination) {
        setHasMore(leadsData.pagination.page < leadsData.pagination.pages);
      } else {
        setHasMore(false);
      }

      // Procesar los contactos
      if (Array.isArray(leadsData)) {
        append ? setLeads([...leads, ...leadsData]) : setLeads(leadsData);
      } else if (leadsData && Array.isArray(leadsData.leads)) {
        append ? setLeads([...leads, ...leadsData.leads]) : setLeads(leadsData.leads);
      } else {
        !append && setLeads([]);
      }
    } catch (error) {
      console.error('Error al cargar contactos:', error);
      !append && setLeads([]);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    const fetchCampaignDetails = async () => {
      try {
        setLoading(true);
        const campaignData = await Campaign.getById(id);
        console.log('Datos de campaña obtenidos:', campaignData);
        setCampaign(campaignData);

        // Cargar la primera página de contactos
        await loadLeads(1);
      } catch (error) {
        console.error('Error al cargar campaña:', error);
        setError('No se pudo cargar la información de la campaña. Inténtelo de nuevo más tarde.');
        setLoading(false);
      }
    };

    fetchCampaignDetails();
  }, [id]);

  // Función para cargar más contactos
  const loadMoreLeads = () => {
    if (!loadingMore && hasMore) {
      setPage(prev => prev + 1);
      loadLeads(page + 1, true);
    }
  };

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
  
  if (!campaign) {
    return (
      <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative" role="alert">
        <span className="block sm:inline">No se encontró la campaña solicitada.</span>
      </div>
    );
  }
  
  // Calcular tasa de conversión
  const conversionRate = campaign.totalLeads > 0 
    ? Math.round((campaign.successfulCalls / campaign.totalLeads) * 100) 
    : 0;
  
  // Calcular progreso de llamadas
  const callProgress = campaign.totalLeads > 0 
    ? Math.round((campaign.completedCalls / campaign.totalLeads) * 100) 
    : 0;
  
  // Definir colores para estados de leads
  const statusColors = {
    new: 'bg-blue-100 text-blue-800',
    contacted: 'bg-yellow-100 text-yellow-800',
    qualified: 'bg-green-100 text-green-800',
    unqualified: 'bg-red-100 text-red-800',
    converted: 'bg-purple-100 text-purple-800'
  };
  
  // Etiquetas para estados
  const statusLabels = {
    new: 'Nuevo',
    contacted: 'Contactado',
    qualified: 'Calificado',
    unqualified: 'No calificado',
    converted: 'Convertido'
  };
  
  return (
    <div className="container mx-auto px-4 py-6">
      {/* Encabezado con acciones */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Detalles de la Campaña</h1>
        <div className="flex space-x-2">
          <button 
            onClick={() => navigate(`/campaigns/${id}/edit`)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded"
          >
            Editar
          </button>
          <button 
            onClick={() => {
              if (window.confirm('¿Estás seguro de que deseas eliminar esta campaña?')) {
                Campaign.delete(campaign._id).then(() => {
                  navigate('/campaigns');
                }).catch(error => {
                  console.error('Error al eliminar:', error);
                  alert('Error al eliminar la campaña');
                });
              }
            }}
            className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded"
          >
            Eliminar
          </button>
        </div>
      </div>
      
      {/* Detalles básicos */}
      <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-800">{campaign.name}</h2>
              <p className="text-gray-600 mt-1">{campaign.description}</p>
            </div>
            <span className={`px-3 py-1 text-sm font-medium rounded-full ${
              campaign.status === 'active' 
                ? 'bg-green-100 text-green-800' 
                : campaign.status === 'paused'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-gray-100 text-gray-800'
            }`}>
              {campaign.status === 'active' 
                ? 'Activa' 
                : campaign.status === 'paused'
                  ? 'Pausada'
                  : 'Programada'}
            </span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Fechas de Ejecución</h3>
              <p className="mt-1 text-gray-900">
                {new Date(campaign.startDate).toLocaleDateString()} - {new Date(campaign.endDate).toLocaleDateString()}
              </p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500">Horario de Llamadas</h3>
              <p className="mt-1 text-gray-900">
                {campaign.callHoursStart || '09:00'} - {campaign.callHoursEnd || '18:00'} 
                ({campaign.timezone || 'GMT-5'})
              </p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500">Días de Llamada</h3>
              <div className="mt-1 flex flex-wrap gap-1">
                {campaign.callDays ? (
                  Object.entries(campaign.callDays)
                    .filter(([_, enabled]) => enabled)
                    .map(([day]) => (
                      <span key={day} className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                        {day.charAt(0).toUpperCase() + day.slice(1)}
                      </span>
                    ))
                ) : (
                  <span className="text-gray-500">No especificado</span>
                )}
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500">Intentos Máximos</h3>
              <p className="mt-1 text-gray-900">{campaign.maxAttempts || 3}</p>
            </div>
          </div>
          
          {campaign.callScript && (
            <div className="mt-6">
              <h3 className="text-sm font-medium text-gray-500">Guion de Llamada</h3>
              <div className="mt-1 p-3 bg-gray-50 rounded border border-gray-200">
                <p className="text-gray-700 whitespace-pre-line">{campaign.callScript}</p>
              </div>
            </div>
          )}
          
          {campaign.targetAudience && (
            <div className="mt-4">
              <h3 className="text-sm font-medium text-gray-500">Público Objetivo</h3>
              <p className="mt-1 text-gray-700">{campaign.targetAudience}</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Estadísticas y progreso */}
      <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">Progreso de la Campaña</h2>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-50 p-4 rounded">
              <h3 className="text-sm font-medium text-gray-500">Contactos Totales</h3>
              <p className="mt-1 text-2xl font-semibold text-gray-900">{campaign.totalLeads || 0}</p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded">
              <h3 className="text-sm font-medium text-gray-500">Llamadas Completadas</h3>
              <p className="mt-1 text-2xl font-semibold text-gray-900">
                {campaign.completedCalls || 0} / {campaign.totalLeads || 0}
              </p>
              <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                <div 
                  className="bg-blue-600 h-2.5 rounded-full" 
                  style={{ width: `${callProgress}%` }}
                ></div>
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded">
              <h3 className="text-sm font-medium text-gray-500">Tasa de Conversión</h3>
              <p className="mt-1 text-2xl font-semibold text-gray-900">
                {campaign.successfulCalls || 0} ({conversionRate}%)
              </p>
              <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                <div 
                  className="bg-green-600 h-2.5 rounded-full" 
                  style={{ width: `${conversionRate}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Leads de la campaña */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-800">Contactos de la Campaña</h2>
          <button 
            onClick={() => navigate(`/campaigns/${id}/import-leads`)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded"
          >
            Importar Contactos
          </button>
        </div>
        
        {leads.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            <p>No hay contactos asociados a esta campaña.</p>
            <button 
              onClick={() => navigate(`/campaigns/${id}/import-leads`)}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Importar contactos
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Nombre
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Teléfono
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Empresa
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Intentos
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Última llamada
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {leads.map(lead => (
                  <tr key={lead._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{lead.name || 'Sin nombre'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{lead.email || 'Sin email'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{lead.phone || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{lead.company || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{lead.callAttempts || 0}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {lead.lastCallDate ? new Date(lead.lastCallDate).toLocaleDateString() : 'Nunca'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        statusColors[lead.status || 'new']
                      }`}>
                        {statusLabels[lead.status || 'new']}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-3">
                        <button
                          onClick={() => navigate(`/leads/${lead._id}`)}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          Ver
                        </button>
                        <button
                          onClick={() => navigate(`/leads/${lead._id}/edit`)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Editar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {hasMore && (
            <div className="flex justify-center mt-4 mb-6">
              <button 
                onClick={loadMoreLeads}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-300"
                disabled={loadingMore}
              >
                {loadingMore ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Cargando...
                  </span>
                ) : 'Cargar más contactos'}
              </button>
            </div>
          )}
        )}
      </div>
    </div>
  );
};

export default CampaignDetail;