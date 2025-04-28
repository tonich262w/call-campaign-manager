// src/pages/CampaignsPage.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Campaign } from '../services/apiService';
import { format } from 'date-fns';
import { 
  FaPlus, 
  FaEdit, 
  FaPause, 
  FaPlay, 
  FaTrash, 
  FaSearch,
  FaSync
} from 'react-icons/fa';

const CampaignsPage = () => {
  const navigate = useNavigate();
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const loadCampaigns = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Usar el servicio de API real para obtener las campañas
      const data = await Campaign.getAll();
      setCampaigns(Array.isArray(data) ? data : (data.campaigns || []));
      setLoading(false);
      
    } catch (err) {
      console.error('Error loading campaigns:', err);
      setError('Error al cargar las campañas');
      setLoading(false);
      
      // Si hay un error, mostrar datos de ejemplo para desarrollo
      const mockCampaigns = [
        {
          _id: '1',
          name: 'Campaña de Ventas Q2',
          description: 'Campaña para el segundo trimestre',
          startDate: new Date(2025, 3, 1),
          endDate: new Date(2025, 5, 30),
          status: 'active',
          totalLeads: 250,
          completedCalls: 120,
          successfulCalls: 45
        },
        {
          _id: '2',
          name: 'Seguimiento Clientes',
          description: 'Seguimiento a clientes existentes',
          startDate: new Date(2025, 2, 15),
          endDate: new Date(2025, 4, 15),
          status: 'paused',
          totalLeads: 150,
          completedCalls: 80,
          successfulCalls: 30
        },
        {
          _id: '3',
          name: 'Encuesta de Satisfacción',
          description: 'Encuesta para medir satisfacción',
          startDate: new Date(2025, 4, 1),
          endDate: new Date(2025, 4, 30),
          status: 'scheduled',
          totalLeads: 500,
          completedCalls: 0,
          successfulCalls: 0
        }
      ];
      
      setCampaigns(mockCampaigns);
    }
  };

  useEffect(() => {
    loadCampaigns();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadCampaigns();
    setTimeout(() => setRefreshing(false), 500);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    // Implementar búsqueda
  };

  const handleCreateCampaign = () => {
    navigate('/campaigns/new');
  };

  const handleEditCampaign = (id) => {
    navigate(`/campaigns/${id}`);
  };

  const handlePauseCampaign = async (id) => {
    try {
      // Llamar a la API para pausar la campaña
      await Campaign.pause(id);
      
      // Recargar las campañas para reflejar el cambio
      setRefreshing(true);
      await loadCampaigns();
      setRefreshing(false);
    } catch (err) {
      console.error('Error pausing campaign:', err);
      alert('Error al pausar la campaña');
    }
  };

  const handleResumeCampaign = async (id) => {
    try {
      // Llamar a la API para reanudar la campaña
      await Campaign.resume(id);
      
      // Recargar las campañas para reflejar el cambio
      setRefreshing(true);
      await loadCampaigns();
      setRefreshing(false);
    } catch (err) {
      console.error('Error resuming campaign:', err);
      alert('Error al reanudar la campaña');
    }
  };

  const handleDeleteCampaign = async (id) => {
    if (window.confirm('¿Está seguro que desea eliminar esta campaña?')) {
      try {
        // Eliminar la campaña
        setRefreshing(true);
        await Campaign.delete(id);
        
        // Recargar las campañas para reflejar el cambio
        await loadCampaigns();
        setRefreshing(false);
      } catch (err) {
        console.error('Error deleting campaign:', err);
        alert('Error al eliminar la campaña');
      }
    }
  };

  const filteredCampaigns = campaigns.filter(campaign => 
    campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    campaign.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Campañas</h1>
        <div className="flex space-x-3">
          <button 
            onClick={handleCreateCampaign}
            className="flex items-center bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded"
          >
            <FaPlus className="mr-2" />
            Nueva Campaña
          </button>
          <button 
            onClick={handleRefresh}
            disabled={loading || refreshing}
            className={`flex items-center bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded
              ${(loading || refreshing) ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            <FaSync className={`mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Actualizar
          </button>
        </div>
      </div>

      {/* Búsqueda */}
      <div className="mb-6">
        <form onSubmit={handleSearch} className="flex">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar campañas..."
              className="pl-10 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <button
            type="submit"
            className="ml-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Buscar
          </button>
        </form>
      </div>

      {loading && !refreshing ? (
        <div className="text-center py-6">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-2">Cargando campañas...</p>
        </div>
      ) : error ? (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
          <p>{error}</p>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nombre
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fechas
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Progreso
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCampaigns.length > 0 ? (
                filteredCampaigns.map(campaign => (
                  <tr key={campaign._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{campaign.name}</div>
                      <div className="text-sm text-gray-500">{campaign.description}</div>
                      <div className="text-sm text-indigo-600 hover:text-indigo-900 mt-1">
                        <a 
                          href={`/api/campaigns/${campaign._id}/export-progress`} 
                          download // Sugiere al navegador descargar el archivo
                        >
                          Descargar Progreso (CSV)
                        </a>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {format(new Date(campaign.startDate), 'dd/MM/yyyy')}
                      </div>
                      <div className="text-sm text-gray-500">
                        a {format(new Date(campaign.endDate), 'dd/MM/yyyy')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
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
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {campaign.completedCalls} / {campaign.totalLeads} llamadas
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1">
                        <div 
                          className="bg-blue-600 h-2.5 rounded-full" 
                          style={{ width: `${(campaign.completedCalls / campaign.totalLeads) * 100}%` }}
                        ></div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEditCampaign(campaign._id)}
                        className="text-indigo-600 hover:text-indigo-900 mr-3"
                      >
                        <FaEdit />
                      </button>
                      
                      {campaign.status === 'active' ? (
                        <button
                          onClick={() => handlePauseCampaign(campaign._id)}
                          className="text-yellow-600 hover:text-yellow-900 mr-3"
                        >
                          <FaPause />
                        </button>
                      ) : campaign.status === 'paused' ? (
                        <button
                          onClick={() => handleResumeCampaign(campaign._id)}
                          className="text-green-600 hover:text-green-900 mr-3"
                        >
                          <FaPlay />
                        </button>
                      ) : null}
                      
                      <button
                        onClick={() => handleDeleteCampaign(campaign._id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                    No se encontraron campañas
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default CampaignsPage;
