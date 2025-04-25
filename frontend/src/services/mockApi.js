// src/services/mockApi.js
// Esta API mock simula el comportamiento del backend para facilitar el desarrollo

// Usuarios mock
const mockUsers = [
  {
    id: 1,
    email: 'admin@example.com',
    password: 'password123', // En producción NUNCA guardar contraseñas en texto plano
    name: 'Admin User',
    role: 'admin'
  },
  {
    id: 2,
    email: 'user@example.com',
    password: 'password123',
    name: 'Regular User',
    role: 'user'
  }
];

// Balance inicial por usuario
const mockBalances = {
  1: { balance: 10000, realBalance: 5000 }, // Admin tiene saldo inflado 2x
  2: { balance: 5000, realBalance: 2500 }   // Usuario normal también
};

// Factor de inflación
const INFLATION_FACTOR = 2;

// Transacciones mock
let mockTransactions = [
  {
    id: 1,
    userId: 1,
    type: 'deposit',
    amount: 10000,
    realAmount: 5000,
    date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    description: 'Depósito inicial'
  },
  {
    id: 2,
    userId: 2,
    type: 'deposit',
    amount: 5000,
    realAmount: 2500,
    date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    description: 'Depósito inicial'
  },
  {
    id: 3,
    userId: 1,
    type: 'charge',
    amount: -500,
    realAmount: -250,
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    description: 'Campaña de prueba'
  }
];

// Campañas mock
let mockCampaigns = [
  {
    id: 1,
    userId: 1,
    name: 'Campaña de Bienvenida',
    status: 'active',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    totalLeads: 100,
    completedCalls: 45,
    costPerCall: 10 // Costo inflado
  },
  {
    id: 2,
    userId: 2,
    name: 'Encuesta de Satisfacción',
    status: 'paused',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    totalLeads: 50,
    completedCalls: 20,
    costPerCall: 12 // Costo inflado
  }
];

// Llamadas mock
let mockCalls = [
  {
    id: 1,
    campaignId: 1,
    userId: 1,
    phoneNumber: '+5491123456789',
    status: 'completed',
    duration: 120, // segundos
    cost: 20, // Costo inflado
    realCost: 10, // Costo real
    date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 2,
    campaignId: 1,
    userId: 1,
    phoneNumber: '+5491187654321',
    status: 'failed',
    duration: 0,
    cost: 0,
    realCost: 0,
    date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
  },
  // Más llamadas...
];

// Simulamos un retraso en las respuestas para emular condiciones reales
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Generar token JWT (simplificado para mock)
const generateToken = (user) => {
  return `mock-jwt-token-${user.id}-${Date.now()}`;
};

// Servicio de autenticación mock
export const mockAuthService = {
  login: async (email, password) => {
    await delay(800); // Simular latencia
    
    const user = mockUsers.find(u => u.email === email && u.password === password);
    
    if (!user) {
      throw { response: { data: { message: 'Credenciales inválidas' } } };
    }
    
    // Eliminar la contraseña para no enviarla al cliente
    const { password: _, ...userWithoutPassword } = user;
    
    return {
      user: userWithoutPassword,
      token: generateToken(user)
    };
  },
  
  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    return JSON.parse(userStr);
  },
  
  logout: () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  },
  
  isAuthenticated: () => {
    return !!localStorage.getItem('authToken');
  }
};

// Servicio de balance mock
export const mockBalanceService = {
  getBalance: async () => {
    await delay(500);
    
    const user = mockAuthService.getCurrentUser();
    if (!user) throw new Error('Usuario no autenticado');
    
    const userBalance = mockBalances[user.id] || { balance: 0 };
    
    return { balance: userBalance.balance };
  },
  
  addFunds: async (amount) => {
    await delay(1000);
    
    const user = mockAuthService.getCurrentUser();
    if (!user) throw new Error('Usuario no autenticado');
    
    // Asegurarnos de que la cantidad es un número y es positiva
    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      throw new Error('La cantidad debe ser un número positivo');
    }
    
    // Calcular el monto real (sin inflación)
    const realAmount = numAmount / INFLATION_FACTOR;
    
    // Actualizar balance
    if (!mockBalances[user.id]) {
      mockBalances[user.id] = { balance: 0, realBalance: 0 };
    }
    
    mockBalances[user.id].balance += numAmount;
    mockBalances[user.id].realBalance += realAmount;
    
    // Crear transacción
    const transaction = {
      id: mockTransactions.length + 1,
      userId: user.id,
      type: 'deposit',
      amount: numAmount,
      realAmount: realAmount,
      date: new Date().toISOString(),
      description: 'Depósito de fondos'
    };
    
    mockTransactions.push(transaction);
    
    return { 
      balance: mockBalances[user.id].balance,
      transaction
    };
  },
  
  getTransactions: async () => {
    await delay(700);
    
    const user = mockAuthService.getCurrentUser();
    if (!user) throw new Error('Usuario no autenticado');
    
    // Filtrar transacciones del usuario actual y ordenarlas por fecha (más reciente primero)
    const userTransactions = mockTransactions
      .filter(t => t.userId === user.id)
      .sort((a, b) => new Date(b.date) - new Date(a.date));
    
    return { transactions: userTransactions };
  },
  
  getAdminBalanceDetails: async () => {
    await delay(600);
    
    const user = mockAuthService.getCurrentUser();
    if (!user) throw new Error('Usuario no autenticado');
    
    // Verificar si es admin
    if (user.role !== 'admin') {
      throw { response: { status: 403, data: { message: 'Acceso denegado' } } };
    }
    
    // Obtener todos los balances (reales e inflados)
    const allBalances = Object.entries(mockBalances).map(([userId, balanceData]) => ({
      userId: Number(userId),
      inflatedBalance: balanceData.balance,
      realBalance: balanceData.realBalance
    }));
    
    // Calcular totales
    const totalInflated = allBalances.reduce((sum, b) => sum + b.inflatedBalance, 0);
    const totalReal = allBalances.reduce((sum, b) => sum + b.realBalance, 0);
    
    return {
      userBalances: allBalances,
      totals: {
        inflatedBalance: totalInflated,
        realBalance: totalReal
      },
      inflationFactor: INFLATION_FACTOR
    };
  }
};

// Servicio de campañas mock
export const mockCampaignService = {
  getAllCampaigns: async () => {
    await delay(800);
    
    const user = mockAuthService.getCurrentUser();
    if (!user) throw new Error('Usuario no autenticado');
    
    // Si es admin, mostrar todas las campañas
    // Si es usuario normal, filtrar solo sus campañas
    const campaigns = user.role === 'admin'
      ? mockCampaigns
      : mockCampaigns.filter(c => c.userId === user.id);
    
    return { campaigns };
  },
  
  getCampaign: async (id) => {
    await delay(500);
    
    const user = mockAuthService.getCurrentUser();
    if (!user) throw new Error('Usuario no autenticado');
    
    const campaign = mockCampaigns.find(c => c.id === Number(id));
    
    if (!campaign) {
      throw { response: { status: 404, data: { message: 'Campaña no encontrada' } } };
    }
    
    // Verificar si el usuario tiene acceso a esta campaña
    if (campaign.userId !== user.id && user.role !== 'admin') {
      throw { response: { status: 403, data: { message: 'Acceso denegado' } } };
    }
    
    return { campaign };
  },
  
  createCampaign: async (campaignData) => {
    await delay(1200);
    
    const user = mockAuthService.getCurrentUser();
    if (!user) throw new Error('Usuario no autenticado');
    
    // Validar datos mínimos
    if (!campaignData.name) {
      throw new Error('El nombre de la campaña es obligatorio');
    }
    
    // Crear nueva campaña
    const newCampaign = {
      id: mockCampaigns.length + 1,
      userId: user.id,
      name: campaignData.name,
      status: 'draft',
      createdAt: new Date().toISOString(),
      totalLeads: 0,
      completedCalls: 0,
      costPerCall: campaignData.costPerCall || 10,
      ...campaignData // Otros campos proporcionados
    };
    
    mockCampaigns.push(newCampaign);
    
    return { campaign: newCampaign };
  }
};

// Servicio de llamadas mock
export const mockCallService = {
  getCallCostEstimate: async (countryCode) => {
    await delay(400);
    
    // Costos inflados mock por país
    const costsByCountry = {
      'AR': 10,  // Argentina
      'MX': 8,   // México
      'CO': 12,  // Colombia
      'ES': 15,  // España
      'US': 20,  // Estados Unidos
      'default': 12 // Por defecto
    };
    
    const inflatedCost = costsByCountry[countryCode] || costsByCountry.default;
    const realCost = inflatedCost / INFLATION_FACTOR;
    
    return { 
      costPerMinute: inflatedCost,
      countryCode,
      currency: 'USD'
    };
  },
  
  getCampaignCallHistory: async (campaignId) => {
    await delay(700);
    
    const user = mockAuthService.getCurrentUser();
    if (!user) throw new Error('Usuario no autenticado');
    
    // Verificar si la campaña existe
    const campaign = mockCampaigns.find(c => c.id === Number(campaignId));
    if (!campaign) {
      throw { response: { status: 404, data: { message: 'Campaña no encontrada' } } };
    }
    
    // Verificar si el usuario tiene acceso a esta campaña
    if (campaign.userId !== user.id && user.role !== 'admin') {
      throw { response: { status: 403, data: { message: 'Acceso denegado' } } };
    }
    
    // Filtrar llamadas por campaña
    const campaignCalls = mockCalls
      .filter(call => call.campaignId === Number(campaignId))
      .sort((a, b) => new Date(b.date) - new Date(a.date));
    
    return { 
      calls: campaignCalls,
      totalCalls: campaignCalls.length,
      completedCalls: campaignCalls.filter(c => c.status === 'completed').length,
      totalCost: campaignCalls.reduce((sum, call) => sum + call.cost, 0)
    };
  }
};

// Exportamos todos los servicios mock
export const mockApi = {
  auth: mockAuthService,
  balance: mockBalanceService,
  campaigns: mockCampaignService,
  calls: mockCallService
};

export default mockApi;