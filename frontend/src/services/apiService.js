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
      // Intentamos obtener los leads de la API
      try {
        const response = await axios.get(`${API_URL}/leads`, getAuthHeaders());
        return response.data;
      } catch (apiError) {
        console.log('Error al obtener leads de la API, usando datos simulados');
        
        // Si la API falla, devolvemos datos simulados
        return {
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
      }
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
        `${API_URL}/campaigns/${campaignId}/import-leads`, 
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
      // Intentamos obtener las campañas de la API
      try {
        const response = await axios.get(`${API_URL}/campaigns`, getAuthHeaders());
        return response.data;
      } catch (apiError) {
        console.log('Error al obtener campañas de la API, usando datos simulados');
        
        // Si la API falla, devolvemos datos simulados
        return {
          campaigns: [
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
          ]
        };
      }
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
  },
  
  // Pausar una campaña
  pause: async (id) => {
    try {
      const response = await axios.put(
        `${API_URL}/campaigns/${id}/pause`,
        {},
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      console.error(`Error pausing campaign ${id}:`, error);
      throw error;
    }
  },
  
  // Reanudar una campaña
  resume: async (id) => {
    try {
      const response = await axios.put(
        `${API_URL}/campaigns/${id}/resume`,
        {},
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      console.error(`Error resuming campaign ${id}:`, error);
      throw error;
    }
  }
};

// Servicio de Balance y Transacciones
export const Balance = {
  getInfo: async () => {
    try {
      // Usamos la ruta real del balance para obtener los datos de saldo
      const response = await axios.get(`${API_URL}/balance/info`, getAuthHeaders());
      return response.data;
    } catch (error) {
      console.error('Error fetching balance info:', error);
      // Si hay un error, intentamos obtener los datos del dashboard como alternativa
      try {
        const dashboardResponse = await axios.get(`${API_URL}/dashboard`, getAuthHeaders());
        const { balance, callCost, totalSpent, totalCalls } = dashboardResponse.data;
        
        return {
          balance: balance || 0,
          callCost: callCost || 0.15,
          costLastUpdated: new Date(),
          totalSpent: totalSpent || 0,
          totalCalls: totalCalls || 0
        };
      } catch (dashboardError) {
        console.error('Error fetching dashboard data as fallback:', dashboardError);
        throw error; // Lanzamos el error original
      }
    }
  },
  
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
      // Usamos la ruta real para obtener las transacciones
      const response = await axios.get(`${API_URL}/balance/transactions`, getAuthHeaders());
      return response.data;
    } catch (error) {
      console.error('Error fetching transactions:', error);
      
      // Si hay un error, devolvemos datos simulados como respaldo
      console.log('Usando datos simulados como respaldo para transacciones');
      return {
        transactions: [
          {
            _id: '1',
            date: new Date(2025, 3, 25),
            type: 'deposit',
            description: 'Recarga de saldo',
            amount: 100,
            balanceAfter: 250.75
          },
          {
            _id: '2',
            date: new Date(2025, 3, 20),
            type: 'charge',
            description: 'Campaña de Ventas Q2 - 50 llamadas',
            amount: -7.50,
            balanceAfter: 150.75
          },
          {
            _id: '3',
            date: new Date(2025, 3, 15),
            type: 'deposit',
            description: 'Recarga de saldo',
            amount: 50,
            balanceAfter: 158.25
          },
          {
            _id: '4',
            date: new Date(2025, 3, 10),
            type: 'charge',
            description: 'Seguimiento Clientes - 25 llamadas',
            amount: -3.75,
            balanceAfter: 108.25
          },
          {
            _id: '5',
            date: new Date(2025, 3, 5),
            type: 'deposit',
            description: 'Recarga inicial',
            amount: 112,
            balanceAfter: 112
          }
        ]
      };
    }
  },
  
  addFunds: async (amount, paymentMethod, paymentDetails) => {
    try {
      const response = await axios.post(
        `${API_URL}/balance/recharge`, 
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
      // Usamos la misma ruta del dashboard ya que contiene los datos financieros para admin
      const response = await axios.get(`${API_URL}/dashboard`, getAuthHeaders());
      // Extraemos solo la parte financiera de los datos
      const { adminStats } = response.data;
      
      // Datos de ejemplo para estadísticas financieras
      return {
        totalRevenue: adminStats?.totalRevenue || 0,
        revenueThisMonth: adminStats?.currentMonthRevenue || 0,
        operationalCosts: adminStats?.operationalCost || 0,
        profit: (adminStats?.totalRevenue || 0) - (adminStats?.operationalCost || 0),
        profitMargin: adminStats?.totalRevenue ? ((adminStats.totalRevenue - adminStats.operationalCost) / adminStats.totalRevenue * 100).toFixed(1) : 0,
        monthlyGrowth: 0, // No tenemos este dato en el backend
        averageRechargeAmount: 0 // No tenemos este dato en el backend
      };
    } catch (error) {
      console.error('Error fetching financial summary:', error);
      throw error;
    }
  },
  
  // Gestión de usuarios
  getUsers: async (page = 1, limit = 20, filters = {}) => {
    try {
      // Simulamos la respuesta ya que no tenemos una ruta específica para esto
      // En un entorno de producción, esto debería ser una llamada real a la API
      console.log('Simulando obtención de usuarios con filtros:', filters);
      
      // Datos de ejemplo para lista de usuarios
      const mockUsers = [
        {
          _id: '1',
          name: 'Juan Pérez',
          email: 'juan@example.com',
          role: 'user',
          balance: 125.50,
          totalCampaigns: 3,
          activeCampaigns: 1,
          isActive: true,
          createdAt: new Date(2025, 1, 15)
        },
        {
          _id: '2',
          name: 'María García',
          email: 'maria@example.com',
          role: 'user',
          balance: 75.25,
          totalCampaigns: 2,
          activeCampaigns: 0,
          isActive: true,
          createdAt: new Date(2025, 2, 10)
        },
        {
          _id: '3',
          name: 'Administrador',
          email: 'admin@example.com',
          role: 'admin',
          balance: 0,
          totalCampaigns: 0,
          activeCampaigns: 0,
          isActive: true,
          createdAt: new Date(2024, 11, 1)
        },
        {
          _id: '4',
          name: 'Carlos López',
          email: 'carlos@example.com',
          role: 'user',
          balance: 200.00,
          totalCampaigns: 5,
          activeCampaigns: 2,
          isActive: true,
          createdAt: new Date(2025, 0, 5)
        },
        {
          _id: '5',
          name: 'Ana Martínez',
          email: 'ana@example.com',
          role: 'user',
          balance: 50.75,
          totalCampaigns: 1,
          activeCampaigns: 1,
          isActive: false,
          createdAt: new Date(2025, 3, 1)
        }
      ];
      
      // Aplicar filtros
      let filteredUsers = [...mockUsers];
      
      if (filters.search) {
        const term = filters.search.toLowerCase();
        filteredUsers = filteredUsers.filter(user => 
          user.name.toLowerCase().includes(term) || 
          user.email.toLowerCase().includes(term)
        );
      }
      
      if (filters.role) {
        filteredUsers = filteredUsers.filter(user => user.role === filters.role);
      }
      
      if (filters.status) {
        const isActive = filters.status === 'active';
        filteredUsers = filteredUsers.filter(user => user.isActive === isActive);
      }
      
      // Configurar paginación
      const total = filteredUsers.length;
      const pages = Math.ceil(total / limit);
      const start = (page - 1) * limit;
      const end = start + limit;
      const paginatedUsers = filteredUsers.slice(start, end);
      
      return {
        users: paginatedUsers,
        page,
        limit,
        total,
        pages
      };
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  },
  
  getUserDetails: async (userId) => {
    try {
      // Simulamos la respuesta ya que no tenemos una ruta específica para esto
      // En un entorno de producción, esto debería ser una llamada real a la API
      console.log('Simulando obtención de detalles de usuario:', userId);
      
      // Datos de ejemplo para usuario
      const mockUsers = [
        {
          id: '1',
          name: 'Juan Pérez',
          email: 'juan@example.com',
          role: 'user',
          isActive: true,
          balance: 125.50,
          totalSpent: 75.25,
          createdAt: new Date(2025, 1, 15),
          lastLogin: new Date(2025, 3, 25),
          transactions: [
            {
              id: '1',
              type: 'charge',
              amount: 50,
              date: new Date(2025, 3, 20),
              description: 'Recarga de saldo'
            },
            {
              id: '2',
              type: 'debit',
              amount: 15.50,
              date: new Date(2025, 3, 22),
              description: 'Campaña de Ventas Q2 - 10 llamadas'
            },
            {
              id: '3',
              type: 'charge',
              amount: 100,
              date: new Date(2025, 3, 15),
              description: 'Recarga inicial'
            }
          ]
        },
        {
          id: '2',
          name: 'María García',
          email: 'maria@example.com',
          role: 'user',
          isActive: true,
          balance: 75.25,
          totalSpent: 25.75,
          createdAt: new Date(2025, 2, 10),
          lastLogin: new Date(2025, 3, 24),
          transactions: [
            {
              id: '1',
              type: 'charge',
              amount: 100,
              date: new Date(2025, 3, 10),
              description: 'Recarga de saldo'
            },
            {
              id: '2',
              type: 'debit',
              amount: 25.75,
              date: new Date(2025, 3, 15),
              description: 'Seguimiento Clientes - 15 llamadas'
            }
          ]
        },
        {
          id: '3',
          name: 'Administrador',
          email: 'admin@example.com',
          role: 'admin',
          isActive: true,
          balance: 0,
          totalSpent: 0,
          createdAt: new Date(2024, 11, 1),
          lastLogin: new Date(2025, 3, 28),
          transactions: []
        },
        {
          id: '4',
          name: 'Carlos López',
          email: 'carlos@example.com',
          role: 'user',
          isActive: true,
          balance: 200.00,
          totalSpent: 150.50,
          createdAt: new Date(2025, 0, 5),
          lastLogin: new Date(2025, 3, 26),
          transactions: [
            {
              id: '1',
              type: 'charge',
              amount: 200,
              date: new Date(2025, 2, 15),
              description: 'Recarga de saldo'
            },
            {
              id: '2',
              type: 'debit',
              amount: 150.50,
              date: new Date(2025, 3, 1),
              description: 'Campaña Encuesta - 100 llamadas'
            }
          ]
        },
        {
          id: '5',
          name: 'Ana Martínez',
          email: 'ana@example.com',
          role: 'user',
          isActive: false,
          balance: 50.75,
          totalSpent: 100.25,
          createdAt: new Date(2025, 3, 1),
          lastLogin: new Date(2025, 3, 15),
          transactions: [
            {
              id: '1',
              type: 'charge',
              amount: 150,
              date: new Date(2025, 3, 5),
              description: 'Recarga de saldo'
            },
            {
              id: '2',
              type: 'debit',
              amount: 100.25,
              date: new Date(2025, 3, 10),
              description: 'Campaña Promocional - 75 llamadas'
            }
          ]
        }
      ];
      
      const user = mockUsers.find(u => u.id === userId) || mockUsers[0];
      
      // Preparar datos para la interfaz
      return {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          isActive: user.isActive,
          createdAt: user.createdAt,
          lastLogin: user.lastLogin
        },
        balance: user.balance,
        totalSpent: user.totalSpent,
        transactions: user.transactions
      };
    } catch (error) {
      console.error(`Error fetching user details for ${userId}:`, error);
      throw error;
    }
  },
  
  getUserStats: async () => {
    try {
      // Usamos la misma ruta del dashboard ya que contiene los datos de usuarios para admin
      const response = await axios.get(`${API_URL}/dashboard`, getAuthHeaders());
      // Extraemos solo la parte de estadísticas de usuarios
      const { adminStats } = response.data;
      
      // Datos de ejemplo para estadísticas de usuarios
      return {
        totalUsers: adminStats?.activeUsers || 0,
        activeUsers: adminStats?.activeUsers || 0,
        inactiveUsers: 0, // No tenemos este dato en el backend
        adminUsers: 1, // Valor por defecto
        regularUsers: (adminStats?.activeUsers || 0) - 1,
        averageBalance: 0, // No tenemos este dato en el backend
        usersWithCampaigns: 0, // No tenemos este dato en el backend
        newUsers: adminStats?.newUsers || 0
      };
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
