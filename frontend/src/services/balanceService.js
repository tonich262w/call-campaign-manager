// src/services/balanceService.js

// Factor de inflación para los costos
const INFLATION_FACTOR = 2;

// Mock de datos para balances (en producción, vendría de la API)
const mockBalances = {
  1: { balance: 10000, realBalance: 5000 }, // Admin
  2: { balance: 5000, realBalance: 2500 },  // Usuario regular
};

// Mock de transacciones
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

// Mock de gastos por campaña
const mockCampaignCosts = [
  {
    id: 1,
    userId: 1,
    name: 'Campaña Ventas Q1',
    calls: 208,
    totalMinutes: 785,
    cost: 2080, // Costo inflado
    realCost: 1040, // Costo real
    status: 'active'
  },
  {
    id: 2,
    userId: 2,
    name: 'Seguimiento Clientes',
    calls: 89,
    totalMinutes: 267,
    cost: 890, // Costo inflado
    realCost: 445, // Costo real
    status: 'paused'
  }
];

// Simulamos un retraso en las respuestas para emular condiciones reales
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Servicio de balance
const balanceService = {
  // Obtener el balance del usuario (inflado)
  getBalance: async () => {
    await delay(500);
    
    // Obtener el usuario actual del localStorage
    const userStr = localStorage.getItem('user');
    if (!userStr) throw new Error('Usuario no autenticado');
    
    const user = JSON.parse(userStr);
    const userId = user.id;
    
    if (!mockBalances[userId]) {
      // Si no existe, crear balance inicial
      mockBalances[userId] = { balance: 0, realBalance: 0 };
    }
    
    // Solo devolver el balance inflado
    return { balance: mockBalances[userId].balance };
  },
  
  // Añadir fondos
  addFunds: async (amount) => {
    await delay(800);
    
    // Validar usuario
    const userStr = localStorage.getItem('user');
    if (!userStr) throw new Error('Usuario no autenticado');
    
    const user = JSON.parse(userStr);
    const userId = user.id;
    
    // Validar cantidad
    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      throw new Error('La cantidad debe ser un número positivo');
    }
    
    // Calcular monto real (sin inflación)
    const realAmount = numAmount / INFLATION_FACTOR;
    
    // Inicializar balance si no existe
    if (!mockBalances[userId]) {
      mockBalances[userId] = { balance: 0, realBalance: 0 };
    }
    
    // Actualizar balance
    mockBalances[userId].balance += numAmount;
    mockBalances[userId].realBalance += realAmount;
    
    // Crear transacción
    const transaction = {
      id: mockTransactions.length + 1,
      userId,
      type: 'deposit',
      amount: numAmount,
      realAmount,
      date: new Date().toISOString(),
      description: 'Depósito de fondos'
    };
    
    mockTransactions.push(transaction);
    
    return { 
      balance: mockBalances[userId].balance,
      transaction: {
        ...transaction,
        realAmount: undefined // No enviar el monto real al cliente
      }
    };
  },
  
  // Obtener historial de transacciones (sin montos reales)
  getTransactions: async () => {
    await delay(600);
    
    // Validar usuario
    const userStr = localStorage.getItem('user');
    if (!userStr) throw new Error('Usuario no autenticado');
    
    const user = JSON.parse(userStr);
    const userId = user.id;
    
    // Filtrar transacciones del usuario y eliminar el campo realAmount
    const userTransactions = mockTransactions
      .filter(t => t.userId === userId)
      .map(({ realAmount, ...transaction }) => transaction) // Eliminar realAmount
      .sort((a, b) => new Date(b.date) - new Date(a.date));
    
    return { transactions: userTransactions };
  },
  
  // Obtener costos por campaña
  getCampaignCosts: async () => {
    await delay(700);
    
    // Validar usuario
    const userStr = localStorage.getItem('user');
    if (!userStr) throw new Error('Usuario no autenticado');
    
    const user = JSON.parse(userStr);
    const userId = user.id;
    
    // Filtrar campañas del usuario
    const userCampaigns = mockCampaignCosts
      .filter(c => c.userId === userId)
      .map(({ realCost, ...campaign }) => campaign); // Eliminar realCost para usuarios normales
    
    return { campaigns: userCampaigns };
  },
  
  // Solo para administradores: obtener detalles de balance (real e inflado)
  getAdminBalanceDetails: async () => {
    await delay(900);
    
    // Validar usuario
    const userStr = localStorage.getItem('user');
    if (!userStr) throw new Error('Usuario no autenticado');
    
    const user = JSON.parse(userStr);
    
    // Verificar si es admin
    if (user.role !== 'admin') {
      throw new Error('Acceso denegado. Se requiere rol de administrador.');
    }
    
    // Obtener todos los balances
    const allBalances = Object.entries(mockBalances).map(([userId, data]) => ({
      userId: Number(userId),
      inflatedBalance: data.balance,
      realBalance: data.realBalance
    }));
    
    // Calcular totales
    const totalInflated = allBalances.reduce((sum, b) => sum + b.inflatedBalance, 0);
    const totalReal = allBalances.reduce((sum, b) => sum + b.realBalance, 0);
    
    // Obtener todas las campañas con costos reales
    const allCampaigns = mockCampaignCosts.map(campaign => ({
      ...campaign,
      // Incluir costos reales ya que es admin
    }));
    
    // Obtener todas las transacciones con montos reales
    const allTransactions = mockTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    return {
      userBalances: allBalances,
      totals: {
        inflatedBalance: totalInflated,
        realBalance: totalReal
      },
      inflationFactor: INFLATION_FACTOR,
      campaigns: allCampaigns,
      transactions: allTransactions
    };
  },
  
  // Para usuarios y admins: obtener datos de configuración del sistema
  getSystemConfig: async () => {
    await delay(300);
    
    // Configuración general
    return {
      inflationFactor: INFLATION_FACTOR,
      minRechargeAmount: 50,
      callCost: 10, // Costo inflado
      callMinuteCost: 0.2 // Costo inflado
    };
  },
  
  // Solo para admins: actualizar configuración del sistema
  updateSystemConfig: async (config) => {
    await delay(800);
    
    // Validar usuario admin
    const userStr = localStorage.getItem('user');
    if (!userStr) throw new Error('Usuario no autenticado');
    
    const user = JSON.parse(userStr);
    
    if (user.role !== 'admin') {
      throw new Error('Acceso denegado. Se requiere rol de administrador.');
    }
    
    // En un sistema real, aquí se actualizaría la configuración
    // Para el mock, simplemente devolvemos la misma configuración
    return { 
      success: true,
      message: 'Configuración actualizada correctamente',
      config 
    };
  }
};

export default balanceService;