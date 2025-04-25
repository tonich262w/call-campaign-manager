// services/reportService.js
import api from './api';

// Obtener estadísticas generales
export const getStats = async () => {
  try {
    const response = await api.get('/reports/stats');
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    const message = error.response?.data?.message || 'Error al obtener estadísticas';
    return { success: false, message };
  }
};

// Obtener llamadas por día
export const getCallsByDay = async (days = 7) => {
  try {
    const response = await api.get(`/reports/calls-by-day?days=${days}`);
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Error al obtener llamadas por día:', error);
    const message = error.response?.data?.message || 'Error al obtener datos de llamadas';
    return { success: false, message };
  }
};

// Obtener llamadas recientes
export const getRecentCalls = async (limit = 5) => {
  try {
    const response = await api.get(`/reports/recent-calls?limit=${limit}`);
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Error al obtener llamadas recientes:', error);
    const message = error.response?.data?.message || 'Error al obtener llamadas recientes';
    return { success: false, message };
  }
};

// Obtener reporte financiero
export const getFinancialReport = async () => {
  try {
    const response = await api.get('/reports/financial');
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Error al obtener reporte financiero:', error);
    const message = error.response?.data?.message || 'Error al obtener información financiera';
    return { success: false, message };
  }
};

// Obtener reporte de campaña
export const getCampaignReport = async (campaignId, startDate = null, endDate = null) => {
  try {
    let url = `/reports/campaigns/${campaignId}`;
    const params = new URLSearchParams();
    
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    if (params.toString()) {
      url += `?${params.toString()}`;
    }
    
    const response = await api.get(url);
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Error al obtener reporte de campaña:', error);
    const message = error.response?.data?.message || 'Error al generar el reporte';
    return { success: false, message };
  }
};

// Obtener reporte de rendimiento
export const getPerformanceReport = async (period = 'month') => {
  try {
    const response = await api.get(`/reports/performance?period=${period}`);
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Error al obtener reporte de rendimiento:', error);
    const message = error.response?.data?.message || 'Error al generar el reporte de rendimiento';
    return { success: false, message };
  }
};

// Solo para administradores
// Obtener reporte del sistema
export const getSystemReport = async () => {
  try {
    const response = await api.get('/reports/admin/system');
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Error al obtener reporte del sistema:', error);
    const message = error.response?.data?.message || 'Error al generar el reporte del sistema';
    return { success: false, message };
  }
};

// Obtener reporte de usuarios
export const getUsersReport = async (sortBy = 'revenue', limit = 10) => {
  try {
    const response = await api.get(`/reports/admin/users?sortBy=${sortBy}&limit=${limit}`);
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Error al obtener reporte de usuarios:', error);
    const message = error.response?.data?.message || 'Error al generar el reporte de usuarios';
    return { success: false, message };
  }
};

export default {
  getStats,
  getCallsByDay,
  getRecentCalls,
  getFinancialReport,
  getCampaignReport,
  getPerformanceReport,
  getSystemReport,
  getUsersReport
};