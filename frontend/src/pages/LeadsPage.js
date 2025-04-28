// src/pages/LeadsPage.js

import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { FaSync, FaFilter, FaDownload, FaPlus } from 'react-icons/fa';
import { Lead, Campaign } from '../services/apiService';

const LeadsPage = () => {
  const [leadsData, setLeadsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [campaigns, setCampaigns] = useState(null);
  
  // Cargar datos reales
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Cargar campañas
        const campaignsData = await Campaign.getAll();
        setCampaigns(campaignsData.campaigns || []);
        
        // Cargar leads
        const leadsData = await Lead.getAll();
        setLeadsData(leadsData || { leads: [], total: 0 });
        
        setLoading(false);
        setLastUpdated(new Date());
      } catch (err) {
        console.error('Error loading data:', err);
        setError('Error al cargar los datos');
        setLoading(false);
        
        // Si hay un error, mostrar datos de ejemplo para desarrollo
        const mockCampaigns = [
          { _id: '1', name: 'Campaña de Ventas Q2' },
          { _id: '2', name: 'Seguimiento Clientes' },
          { _id: '3', name: 'Encuesta de Satisfacción' }
        ];
        
        const mockLeads = {
          leads: [
            {
              _id: '1',
              name: 'Juan Pérez',
              email: 'juan@example.com',
              phone: '+52 555 123 4567',
              campaignId: '1',
              status: 'pending',
              updatedAt: new Date(2025, 3, 15)
            },
            {
              _id: '2',
              name: 'María García',
              email: 'maria@example.com',
              phone: '+52 555 765 4321',
              campaignId: '2',
              status: 'contacted',
              updatedAt: new Date(2025, 3, 20)
            },
            {
              _id: '3',
              name: 'Carlos López',
              email: 'carlos@example.com',
              phone: '+52 555 987 6543',
              campaignId: '1',
              status: 'converted',
              updatedAt: new Date(2025, 3, 25)
            },
            {
              _id: '4',
              name: 'Ana Martínez',
              email: 'ana@example.com',
              phone: '+52 555 456 7890',
              campaignId: '3',
              status: 'rejected',
              updatedAt: new Date(2025, 3, 22)
            },
            {
              _id: '5',
              name: 'Roberto Sánchez',
              email: 'roberto@example.com',
              phone: '+52 555 234 5678',
              campaignId: '2',
              status: 'not_reached',
              updatedAt: new Date(2025, 3, 18)
            }
          ],
          total: 5
        };
        
        setCampaigns(mockCampaigns);
        setLeadsData(mockLeads);
      }
    };
    
    loadData();
  }, []);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    try {
      // Cargar campañas
      const campaignsData = await Campaign.getAll();
      setCampaigns(campaignsData.campaigns || []);
      
      // Cargar leads
      const leadsData = await Lead.getAll();
      setLeadsData(leadsData || { leads: [], total: 0 });
      
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Error refreshing data:', err);
      setError('Error al actualizar los datos');
    } finally {
      setIsRefreshing(false);
    }
  };

  // Filtrar leads según los criterios seleccionados
  const filteredLeads = leadsData?.leads ? leadsData.leads.filter(lead => {
    if (selectedCampaign !== 'all' && lead.campaignId !== selectedCampaign) return false;
    if (selectedStatus !== 'all' && lead.status !== selectedStatus) return false;
    return true;
  }) : [];

  return (
    <div className="leads-container p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Contactos</h1>
        <div className="flex items-center">
          {lastUpdated && (
            <span className="text-sm text-gray-500 mr-3">
              Última actualización: {format(new Date(lastUpdated), 'HH:mm:ss')}
            </span>
          )}
          <button 
            onClick={() => setFilterOpen(!filterOpen)}
            className="flex items-center bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded mr-2"
          >
            <FaFilter className="mr-2" />
            Filtros
          </button>
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
            Importar Contactos
          </button>
        </div>
      </div>

      {filterOpen && (
        <div className="filter-panel bg-gray-50 p-4 rounded-lg mb-4 border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Campaña</label>
              <select 
                className="w-full border border-gray-300 rounded px-3 py-2"
                value={selectedCampaign}
                onChange={(e) => setSelectedCampaign(e.target.value)}
              >
                <option value="all">Todas las campañas</option>
                {campaigns && campaigns.map(campaign => (
                  <option key={campaign._id} value={campaign._id}>
                    {campaign.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
              <select 
                className="w-full border border-gray-300 rounded px-3 py-2"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                <option value="all">Todos los estados</option>
                <option value="pending">Pendiente</option>
                <option value="contacted">Contactado</option>
                <option value="not_reached">No alcanzado</option>
                <option value="callback">Llamar de nuevo</option>
                <option value="converted">Convertido</option>
                <option value="rejected">Rechazado</option>
              </select>
            </div>
            <div className="flex items-end">
              <button 
                onClick={() => {
                  setSelectedCampaign('all');
                  setSelectedStatus('all');
                }}
                className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-50"
              >
                Limpiar filtros
              </button>
            </div>
          </div>
        </div>
      )}

      {loading && !leadsData && (
        <div className="text-center py-6">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-2">Cargando contactos...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
          <p>{error}</p>
          <button 
            onClick={handleManualRefresh}
            className="text-red-700 underline mt-2"
          >
            Intentar nuevamente
          </button>
        </div>
      )}

      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nombre
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Teléfono
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Campaña
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Última actualización
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredLeads.map(lead => {
              // Buscar el nombre de la campaña
              const campaignName = campaigns?.find(c => c._id === lead.campaignId)?.name || 'Desconocida';
              
              return (
                <tr key={lead._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{lead.name}</div>
                    <div className="text-sm text-gray-500">{lead.email || 'No disponible'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{lead.phone}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{campaignName}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${lead.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                      lead.status === 'contacted' ? 'bg-blue-100 text-blue-800' :
                      lead.status === 'converted' ? 'bg-green-100 text-green-800' :
                      lead.status === 'rejected' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'}`}
                    >
                      {lead.status === 'pending' ? 'Pendiente' :
                       lead.status === 'contacted' ? 'Contactado' :
                       lead.status === 'not_reached' ? 'No alcanzado' :
                       lead.status === 'callback' ? 'Llamar de nuevo' :
                       lead.status === 'converted' ? 'Convertido' :
                       lead.status === 'rejected' ? 'Rechazado' : lead.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {lead.updatedAt ? format(new Date(lead.updatedAt), 'dd/MM/yyyy HH:mm') : 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button className="text-blue-600 hover:text-blue-900 mr-3">
                      Ver detalles
                    </button>
                    <button className="text-green-600 hover:text-green-900">
                      Actualizar
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {filteredLeads.length === 0 && (
          <div className="text-center py-6 text-gray-500">
            {leadsData?.leads && leadsData.leads.length > 0 
              ? 'No hay contactos que coincidan con los filtros seleccionados' 
              : 'No hay contactos disponibles'}
          </div>
        )}
      </div>

      {leadsData && (
        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Mostrando {filteredLeads.length} de {leadsData.total || leadsData.leads?.length || 0} contactos
          </div>
          <button className="flex items-center text-green-600 hover:text-green-800">
            <FaDownload className="mr-1" /> Exportar contactos
          </button>
        </div>
      )}
    </div>
  );
};

export default LeadsPage;