// src/services/api.js
import axios from 'axios';

// Crear instancia de axios con configuración base
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3001/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor para agregar token en cada petición
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar respuestas
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Manejo específico para errores de autenticación
    if (error.response && error.response.status === 401) {
      // Token expirado o inválido
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      // Redireccionar al login si es necesario
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Servicio de autenticación
export const authService = {
  login: async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      // Guardar token y datos de usuario
      localStorage.setItem('authToken', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      return response.data;
    } catch (error) {
      console.error('Login error:', error.response?.data || error.message);
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    // Opcionalmente hacer una petición al backend para invalidar el token
    // return api.post('/auth/logout');
  },

  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    return JSON.parse(userStr);
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('authToken');
  },

  register: async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      return response.data;
    } catch (error) {
      console.error('Register error:', error.response?.data || error.message);
      throw error;
    }
  }
};

// Servicio de balance
export const balanceService = {
  getBalance: async () => {
    try {
      const response = await api.get('/balance');
      return response.data;
    } catch (error) {
      console.error('Get balance error:', error.response?.data || error.message);
      throw error;
    }
  },

  addFunds: async (amount) => {
    try {
      const response = await api.post('/balance/add', { amount });
      return response.data;
    } catch (error) {
      console.error('Add funds error:', error.response?.data || error.message);
      throw error;
    }
  },

  getTransactions: async () => {
    try {
      const response = await api.get('/balance/transactions');
      return response.data;
    } catch (error) {
      console.error('Get transactions error:', error.response?.data || error.message);
      throw error;
    }
  },

  // Para panel de administración - ver costos reales vs inflados
  getAdminBalanceDetails: async () => {
    try {
      const response = await api.get('/admin/balance');
      return response.data;
    } catch (error) {
      console.error('Admin balance error:', error.response?.data || error.message);
      throw error;
    }
  }
};

// Servicio de campañas
export const campaignService = {
  getAllCampaigns: async () => {
    try {
      const response = await api.get('/campaigns');
      return response.data;
    } catch (error) {
      console.error('Get campaigns error:', error.response?.data || error.message);
      throw error;
    }
  },

  getCampaign: async (id) => {
    try {
      const response = await api.get(`/campaigns/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Get campaign ${id} error:`, error.response?.data || error.message);
      throw error;
    }
  },

  createCampaign: async (campaignData) => {
    try {
      const response = await api.post('/campaigns', campaignData);
      return response.data;
    } catch (error) {
      console.error('Create campaign error:', error.response?.data || error.message);
      throw error;
    }
  },

  updateCampaign: async (id, campaignData) => {
    try {
      const response = await api.put(`/campaigns/${id}`, campaignData);
      return response.data;
    } catch (error) {
      console.error(`Update campaign ${id} error:`, error.response?.data || error.message);
      throw error;
    }
  },

  deleteCampaign: async (id) => {
    try {
      const response = await api.delete(`/campaigns/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Delete campaign ${id} error:`, error.response?.data || error.message);
      throw error;
    }
  },

  startCampaign: async (id) => {
    try {
      const response = await api.post(`/campaigns/${id}/start`);
      return response.data;
    } catch (error) {
      console.error(`Start campaign ${id} error:`, error.response?.data || error.message);
      throw error;
    }
  },

  pauseCampaign: async (id) => {
    try {
      const response = await api.post(`/campaigns/${id}/pause`);
      return response.data;
    } catch (error) {
      console.error(`Pause campaign ${id} error:`, error.response?.data || error.message);
      throw error;
    }
  }
};

export default api;