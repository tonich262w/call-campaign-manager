// src/services/apiService.js
// Servicios de API para interactuar con el backend
import axios from 'axios';
import { useAuth } from '../hooks/useAuth';

// Configuración base para axios
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Función para obtener el token de autenticación
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      'x-auth-token': token,
      'Authorization': `Bearer ${token}`
    }
  };
};

// Servicio de Leads
export const Lead = {
  getAll: async () => {
    try {
      const response = await axios.get(`${API_URL}/leads`, getAuthHeaders());
      return response.data;
    } catch (error) {
      console.error('Error fetching leads:', error);
      throw error;
    }
  },
  
  getByCampaign: async (campaignId) => {
    try {
      const response = await axios.get(`${API_URL}/leads/campaign/${campaignId}`, getAuthHeaders());
      return response.data;
    } catch (error) {
      console.error(`Error fetching leads for campaign ${campaignId}:`, error);
      throw error;
    }
  },
  
  importLeads: async (campaignId, leads) => {
    try {
      const response = await axios.post(
        `${API_URL}/leads/import/${campaignId}`, 
        { leads }, 
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      console.error('Error importing leads:', error);
      throw error;
    }
  },
  
  update: async (id, data) => {
    try {
      const response = await axios.put(
        `${API_URL}/leads/${id}`, 
        data, 
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      console.error(`Error updating lead ${id}:`, error);
      throw error;
    }
  },
  
  delete: async (id) => {
    try {
      const response = await axios.delete(`${API_URL}/leads/${id}`, getAuthHeaders());
      return response.data;
    } catch (error) {
      console.error(`Error deleting lead ${id}:`, error);
      throw error;
    }
  }
};

// Servicio de Dashboard
export const Dashboard = {
  getData: async () => {
    try {
      const response = await axios.get(`${API_URL}/dashboard`, getAuthHeaders());
      return response.data;
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      throw error;
    }
  }
};

// Servicio de Campañas
export const Campaign = {
  getAll: async () => {
    try {
      const response = await axios.get(`${API_URL}/campaigns`, getAuthHeaders());
      return response.data;
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      throw error;
    }
  },
  
  getById: async (id) => {
    try {
      const response = await axios.get(`${API_URL}/campaigns/${id}`, getAuthHeaders());
      return response.data;
    } catch (error) {
      console.error(`Error fetching campaign ${id}:`, error);
      throw error;
    }
  },
  
  create: async (campaignData) => {
    try {
      const response = await axios.post(
        `${API_URL}/campaigns`, 
        campaignData, 
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      console.error('Error creating campaign:', error);
      throw error;
    }
  },
  
  update: async (id, data) => {
    try {
      const response = await axios.put(
        `${API_URL}/campaigns/${id}`, 
        data, 
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      console.error(`Error updating campaign ${id}:`, error);
      throw error;
    }
  },
  
  delete: async (id) => {
    try {
      const response = await axios.delete(`${API_URL}/campaigns/${id}`, getAuthHeaders());
      return response.data;
    } catch (error) {
      console.error(`Error deleting campaign ${id}:`, error);
      throw error;
    }
  }
};

// Servicio de Balance y Transacciones
export const Balance = {
  getBalance: async () => {
    try {
      const response = await axios.get(`${API_URL}/balance`, getAuthHeaders());
      return response.data;
    } catch (error) {
      console.error('Error fetching balance:', error);
      throw error;
    }
  },
  
  getTransactions: async () => {
    try {
      const response = await axios.get(`${API_URL}/balance/transactions`, getAuthHeaders());
      return response.data;
    } catch (error) {
      console.error('Error fetching transactions:', error);
      throw error;
    }
  },
  
  addFunds: async (amount, paymentMethod, paymentDetails) => {
    try {
      const response = await axios.post(
        `${API_URL}/balance/add`, 
        { amount, paymentMethod, paymentDetails }, 
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      console.error('Error adding funds:', error);
      throw error;
    }
  }
};

// Servicio de Administración
export const Admin = {
  // Estadísticas generales
  getDashboardStats: async () => {
    try {
      const response = await axios.get(`${API_URL}/dashboard`, getAuthHeaders());
      return response.data;
    } catch (error) {
      console.error('Error fetching admin dashboard stats:', error);
      throw error;
    }
  },
  
  // Estadísticas financieras
  getFinancialSummary: async () => {
    try {
      const response = await axios.get(`${API_URL}/balance/admin/summary`, getAuthHeaders());
      return response.data;
    } catch (error) {
      console.error('Error fetching financial summary:', error);
      throw error;
    }
  },
  
  // Gestión de usuarios
  getUsers: async (page = 1, limit = 20, filters = {}) => {
    try {
      const queryParams = new URLSearchParams({
        page,
        limit,
        ...filters
      }).toString();
      
      const response = await axios.get(
        `${API_URL}/users?${queryParams}`, 
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  },
  
  getUserDetails: async (userId) => {
    try {
      const response = await axios.get(
        `${API_URL}/users/${userId}`, 
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      console.error(`Error fetching user details for ${userId}:`, error);
      throw error;
    }
  },
  
  getUserStats: async () => {
    try {
      const response = await axios.get(
        `${API_URL}/users/stats`, 
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching user statistics:', error);
      throw error;
    }
  },
  
  createUser: async (userData) => {
    try {
      const response = await axios.post(
        `${API_URL}/users`, 
        userData, 
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  },
  
  updateUser: async (userId, userData) => {
    try {
      const response = await axios.put(
        `${API_URL}/users/${userId}`, 
        userData, 
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      console.error(`Error updating user ${userId}:`, error);
      throw error;
    }
  },
  
  deleteUser: async (userId) => {
    try {
      const response = await axios.delete(
        `${API_URL}/users/${userId}`, 
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      console.error(`Error deleting user ${userId}:`, error);
      throw error;
    }
  },
  
  // Configuración de precios
  updatePricing: async (pricingData) => {
    try {
      const response = await axios.post(
        `${API_URL}/balance/admin/pricing`, 
        pricingData, 
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      console.error('Error updating pricing:', error);
      throw error;
    }
  },
  
  // Recarga manual de saldo
  addBalanceManually: async (userId, amount, notes) => {
    try {
      const response = await axios.post(
        `${API_URL}/balance/admin/manual-recharge`, 
        { userId, amount, notes }, 
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      console.error('Error adding balance manually:', error);
      throw error;
    }
  }
};
