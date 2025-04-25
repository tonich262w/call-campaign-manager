// backend/index.js
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');
const axios = require('axios');

// Cargar variables de entorno
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors()); // Habilitar CORS
app.use(express.json()); // Parsear JSON

// Variables simuladas (en producción usar una base de datos)
// Estos datos son solo de ejemplo, en un entorno real usarías una DB
let users = [
  {
    id: 1,
    email: 'admin@example.com',
    // En producción, las contraseñas deben estar hasheadas
    passwordHash: '$2b$10$xVqYyJGGCkPzKGPBnTCBCu6njKYUE3X4LLJMc5NmW/vHD9CkN1Xem', // password123
    name: 'Admin User',
    role: 'admin'
  },
  {
    id: 2,
    email: 'user@example.com',
    passwordHash: '$2b$10$xVqYyJGGCkPzKGPBnTCBCu6njKYUE3X4LLJMc5NmW/vHD9CkN1Xem', // password123
    name: 'Regular User',
    role: 'user'
  }
];

// Balance de usuarios (en producción usar una base de datos)
let balances = {
  1: { balance: 10000, realBalance: 5000 }, // Admin
  2: { balance: 5000, realBalance: 2500 }   // Usuario regular
};

// Transacciones (en producción usar una base de datos)
let transactions = [
  {
    id: 1,
    userId: 1,
    type: 'deposit',
    amount: 10000,
    realAmount: 5000,
    date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    description: 'Depósito inicial'
  }
  // Otras transacciones...
];

// Campañas (en producción usar una base de datos)
let campaigns = [
  {
    id: 1,
    userId: 1,
    name: 'Campaña de Prueba',
    status: 'active',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    totalLeads: 100,
    completedCalls: 45,
    costPerCall: 10
  }
  // Otras campañas...
];

// Factor de inflación para los costos
const INFLATION_FACTOR = 2;

// Configuración para Voximplant (oculto para el cliente)
const voximplantConfig = {
  accountId: process.env.VOXIMPLANT_ACCOUNT_ID,
  apiKey: process.env.VOXIMPLANT_API_KEY,
  baseUrl: 'https://api.voximplant.com/platform_api'
};

// Middleware para verificar JWT
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.status(401).json({ message: 'No se proporcionó token de autenticación' });
  
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Token inválido o expirado' });
    
    // Buscar el usuario completo
    const fullUser = users.find(u => u.id === user.id);
    if (!fullUser) return res.status(403).json({ message: 'Usuario no encontrado' });
    
    // Añadir el usuario al objeto request
    req.user = { ...fullUser, passwordHash: undefined }; // No incluir el hash en req.user
    next();
  });
};

// Middleware para verificar si es admin
const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Acceso denegado. Se requiere rol de administrador.' });
  }
  next();
};

// Función para comunicarse con la API de Voximplant
const callVoximplantApi = async (endpoint, params = {}) => {
  try {
    const url = `${voximplantConfig.baseUrl}/${endpoint}`;
    const response = await axios.get(url, {
      params: {
        account_id: voximplantConfig.accountId,
        api_key: voximplantConfig.apiKey,
        ...params
      }
    });
    
    return response.data;
  } catch (error) {
    console.error(`Error llamando a Voximplant API (${endpoint}):`, error.response?.data || error.message);
    throw error;
  }
};

// Rutas de autenticación
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Buscar usuario por email
    const user = users.find(u => u.email === email);
    
    if (!user) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }
    
    // Verificar contraseña
    const passwordMatch = await bcrypt.compare(password, user.passwordHash);
    
    if (!passwordMatch) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }
    
    // Generar token JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    // Devolver usuario (sin el hash de contraseña) y token
    const { passwordHash, ...userWithoutPassword } = user;
    
    res.status(200).json({
      user: userWithoutPassword,
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
});

// Ruta para obtener balance (inflado)
app.get('/api/balance', authenticateToken, (req, res) => {
  try {
    const userId = req.user.id;
    
    if (!balances[userId]) {
      // Si no existe, crear un balance inicial de 0
      balances[userId] = { balance: 0, realBalance: 0 };
    }
    
    res.status(200).json({
      balance: balances[userId].balance,
      // Solo enviar el balance inflado al cliente
    });
  } catch (error) {
    console.error('Get balance error:', error);
    res.status(500).json({ message: 'Error al obtener el balance' });
  }
});

// Ruta para añadir fondos
app.post('/api/balance/add', authenticateToken, (req, res) => {
  try {
    const userId = req.user.id;
    const { amount } = req.body;
    
    // Validar la cantidad
    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return res.status(400).json({ message: 'La cantidad debe ser un número positivo' });
    }
    
    // Calcular monto real (sin inflación)
    const realAmount = numAmount / INFLATION_FACTOR;
    
    // Inicializar balance si no existe
    if (!balances[userId]) {
      balances[userId] = { balance: 0, realBalance: 0 };
    }
    
    // Actualizar balance
    balances[userId].balance += numAmount;
    balances[userId].realBalance += realAmount;
    
    // Crear transacción
    const transaction = {
      id: transactions.length + 1,
      userId,
      type: 'deposit',
      amount: numAmount,
      realAmount,
      date: new Date().toISOString(),
      description: 'Depósito de fondos'
    };
    
    transactions.push(transaction);
    
    res.status(200).json({
      balance: balances[userId].balance,
      transaction: {
        ...transaction,
        realAmount: undefined // No enviar el monto real al cliente
      }
    });
  } catch (error) {
    console.error('Add funds error:', error);
    res.status(500).json({ message: 'Error al añadir fondos' });
  }
});

// Ruta para obtener transacciones
app.get('/api/balance/transactions', authenticateToken, (req, res) => {
  try {
    const userId = req.user.id;
    
    // Filtrar transacciones del usuario y eliminar el campo realAmount
    const userTransactions = transactions
      .filter(t => t.userId === userId)
      .map(({ realAmount, ...transaction }) => transaction) // Eliminar realAmount
      .sort((a, b) => new Date(b.date) - new Date(a.date));
    
    res.status(200).json({
      transactions: userTransactions
    });
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ message: 'Error al obtener las transacciones' });
  }
});

// RUTAS ADMIN - Balance detallado (real e inflado)
app.get('/api/admin/balance', authenticateToken, isAdmin, (req, res) => {
  try {
    // Obtener todos los balances
    const allBalances = Object.entries(balances).map(([userId, data]) => ({
      userId: Number(userId),
      inflatedBalance: data.balance,
      realBalance: data.realBalance
    }));
    
    // Calcular totales
    const totalInflated = allBalances.reduce((sum, b) => sum + b.inflatedBalance, 0);
    const totalReal = allBalances.reduce((sum, b) => sum + b.realBalance, 0);
    
    res.status(200).json({
      userBalances: allBalances,
      totals: {
        inflatedBalance: totalInflated,
        realBalance: totalReal
      },
      inflationFactor: INFLATION_FACTOR
    });
  } catch (error) {
    console.error('Admin balance error:', error);
    res.status(500).json({ message: 'Error al obtener información de balance administrativa' });
  }
});

// Ruta para obtener costo de llamada por país (inflado)
app.get('/api/calls/cost-estimate', authenticateToken, async (req, res) => {
  try {
    const { country } = req.query;
    
    if (!country) {
      return res.status(400).json({ message: 'Se requiere el código de país' });
    }
    
    // En un escenario real, consultaríamos a Voximplant para obtener el costo real
    // y luego lo inflaríamos.
    
    // Esta es una simulación:
    const mockCostByCountry = {
      'AR': 5,  // Argentina
      'MX': 4,  // México
      'CO': 6,  // Colombia
      'ES': 7.5, // España
      'US': 10,  // Estados Unidos
      'default': 6
    };
    
    // Obtener costo real (sin inflación)
    const realCost = mockCostByCountry[country] || mockCostByCountry.default;
    
    // Aplicar inflación
    const inflatedCost = realCost * INFLATION_FACTOR;
    
    res.status(200).json({
      costPerMinute: inflatedCost,
      countryCode: country,
      currency: 'USD'
    });
  } catch (error) {
    console.error('Get call cost error:', error);
    res.status(500).json({ message: 'Error al obtener el costo de llamada' });
  }
});

// Ruta API de Voximplant oculta (ejemplo)
app.post('/api/campaigns/:id/start', authenticateToken, async (req, res) => {
  try {
    const campaignId = parseInt(req.params.id);
    const userId = req.user.id;
    
    // Verificar si la campaña existe y pertenece al usuario
    const campaign = campaigns.find(c => c.id === campaignId && c.userId === userId);
    
    if (!campaign) {
      return res.status(404).json({ message: 'Campaña no encontrada' });
    }
    
    // Verificar balance suficiente
    const userBalance = balances[userId] || { balance: 0, realBalance: 0 };
    const estimatedCost = campaign.totalLeads * campaign.costPerCall;
    
    if (userBalance.balance < estimatedCost) {
      return res.status(400).json({ 
        message: 'Saldo insuficiente para iniciar la campaña',
        requiredBalance: estimatedCost,
        currentBalance: userBalance.balance
      });
    }
    
    // En un escenario real, aquí llamaríamos a la API de Voximplant para iniciar las llamadas
    
    // Simulamos la llamada a Voximplant
    // const voximplantResponse = await callVoximplantApi('StartCampaign', {
    //   campaign_id: campaignId,
    //   // otros parámetros necesarios
    // });
    
    // Actualizar estado de la campaña
    campaign.status = 'active';
    
    res.status(200).json({
      campaign,
      message: 'Campaña iniciada exitosamente'
    });
  } catch (error) {
    console.error('Start campaign error:', error);
    res.status(500).json({ message: 'Error al iniciar la campaña' });
  }
});

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en puerto ${PORT}`);
});
