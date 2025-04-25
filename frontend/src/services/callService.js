// src/services/callService.js
import api from './api';

// Este servicio maneja las operaciones relacionadas con las llamadas,
// ocultando que realmente se está usando Voximplant detrás

const callService = {
  // Obtener costo estimado por minuto para llamadas (inflado)
  getCallCostEstimate: async (countryCode) => {
    try {
      const response = await api.get(`/calls/cost-estimate?country=${countryCode}`);
      return response.data; // Retorna el costo inflado
    } catch (error) {
      console.error('Error getting call cost estimate:', error.response?.data || error.message);
      throw error;
    }
  },

  // Obtener historial de llamadas para una campaña
  getCampaignCallHistory: async (campaignId) => {
    try {
      const response = await api.get(`/campaigns/${campaignId}/calls`);
      return response.data;
    } catch (error) {
      console.error('Error getting call history:', error.response?.data || error.message);
      throw error;
    }
  },

  // Obtener historial general de llamadas
  getCallHistory: async (filters = {}) => {
    try {
      // Construir query string con los filtros
      const queryParams = new URLSearchParams();
      Object.keys(filters).forEach(key => {
        if (filters[key]) queryParams.append(key, filters[key]);
      });
      
      const response = await api.get(`/calls/history?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error getting general call history:', error.response?.data || error.message);
      throw error;
    }
  },

  // Obtener estadísticas de llamadas
  getCallStats: async (campaignId, dateRange) => {
    try {
      let url = '/calls/stats';
      
      // Añadir parámetros si se proporcionan
      const params = new URLSearchParams();
      if (campaignId) params.append('campaignId', campaignId);
      if (dateRange?.start) params.append('startDate', dateRange.start);
      if (dateRange?.end) params.append('endDate', dateRange.end);
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      console.error('Error getting call statistics:', error.response?.data || error.message);
      throw error;
    }
  },

  // Para administradores: obtener costos reales vs inflados
  getAdminCallCosts: async () => {
    try {
      const response = await api.get('/admin/calls/costs');
      return response.data;
    } catch (error) {
      console.error('Error getting admin call costs:', error.response?.data || error.message);
      throw error;
    }
  }
};

export default callService;