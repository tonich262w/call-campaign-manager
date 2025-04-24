const express = require('express');
const router = express.Router();
const {
  createLead,
  importLeads,
  getLeadsByCampaign,
  getLeadById,
  updateLead,
  deleteLead,
} = require('../controllers/leadController');
const { protect } = require('../middlewares/authMiddleware');

// Todas las rutas requieren autenticación
router.use(protect);

router.route('/')
  .post(createLead);

router.route('/:id')
  .get(getLeadById)
  .put(updateLead)
  .delete(deleteLead);

router.post('/import/:campaignId', importLeads);
router.get('/campaign/:campaignId', getLeadsByCampaign);

module.exports = router;


## Paso 21: Crear controlador de reportes

1. Navega a la carpeta `controllers`:
   
   cd ../controllers
   

2. Crea un archivo llamado `reportController.js`:

javascript
const asyncHandler = require('express-async-handler');
const Campaign = require('../models/campaignModel');
const Lead = require('../models/leadModel');
const User = require('../models/userModel');
const Transaction = require('../models/transactionModel');

// @desc    Obtener estadísticas generales del usuario
// @route   GET /api/reports/stats
// @access  Private
const getStats = asyncHandler(async (req, res) => {
  // Contar campañas
  const totalCampaigns = await Campaign.countDocuments({ user: req.user._id });
  const activeCampaigns = await Campaign.countDocuments({
    user: req.user._id,
    status: 'active',
  });

  // Contar leads
  const totalLeads = await Lead.countDocuments({ user: req.user._id });
  const processedLeads = await Lead.countDocuments({
    user: req.user._id,
    status: { $ne: 'pending' },
  });

  // Calcular tasa de éxito
  const successfulCalls = await Lead.countDocuments({
    user: req.user._id,
    status: 'called',
  });

  const successRate = totalLeads > 0 ? Math.round((successfulCalls / totalLeads) * 100) : 0;

  res.json({
    totalCampaigns,
    activeCampaigns,
    totalLeads,
    processedLeads,
    successfulCalls,
    successRate,
  });
});

// @desc    Obtener llamadas por día (últimos 7 días)
// @route   GET /api/reports/calls-by-day
// @access  Private
const getCallsByDay = asyncHandler(async (req, res) => {
  const days = parseInt(req.query.days) || 7;
  
  // Fecha hace N días
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  startDate.setHours(0, 0, 0, 0);

  // Agrupar llamadas por día
  const callsByDay = await Lead.aggregate([
    {
      $match: {
        user: req.user._id,
        lastCallAt: { $gte: startDate },
      },
    },
    {
      $group: {
        _id: {
          year: { $year: '$lastCallAt' },
          month: { $month: '$lastCallAt' },
          day: { $dayOfMonth: '$lastCallAt' },
        },
        calls: { $sum: 1 },
        successful: {
          $sum: {
            $cond: [{ $eq: ['$status', 'called'] }, 1, 0],
          },
        },
      },
    },
    {
      $project: {
        _id: 0,
        date: {
          $dateToString: {
            format: '%Y-%m-%d',
            date: {
              $dateFromParts: {
                year: '$_id.year',
                month: '$_id.month',
                day: '$_id.day',
              },
            },
          },
        },
        calls: 1,
        successful: 1,
      },
    },
    {
      $sort: { date: 1 },
    },
  ]);

  // Completar días sin datos
  const result = [];
  const dateMap = {};
  
  // Crear mapa con los datos existentes
  callsByDay.forEach((dayData) => {
    dateMap[dayData.date] = dayData;
  });
  
  // Llenar datos para todos los días en el rango
  for (let i = 0; i < days; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);
    
    const dateStr = date.toISOString().split('T')[0];
    
    if (dateMap[dateStr]) {
      result.push(dateMap[dateStr]);
    } else {
      result.push({
        date: dateStr,
        calls: 0,
        successful: 0,
      });
    }
  }
  
  // Ordenar por fecha ascendente
  result.sort((a, b) => new Date(a.date) - new Date(b.date));

  res.json(result);
});

// @desc    Obtener llamadas recientes
// @route   GET /api/reports/recent-calls
// @access  Private
const getRecentCalls = asyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit) || 5;

  const recentCalls = await Lead.find({
    user: req.user._id,
    lastCallAt: { $exists: true },
  })
    .sort({ lastCallAt: -1 })
    .limit(limit)
    .select('name phone status lastCallAt attempts')
    .lean();

  // Formatear datos para frontend
  const formattedCalls = recentCalls.map((call) => ({
    id: call._id,
    name: call.name,
    phone: call.phone,
    status: call.status,
    time: call.lastCallAt ? new Date(call.lastCallAt).toLocaleTimeString() : 'N/A',
    attempts: call.attempts,
    duration: Math.floor(Math.random() * 300), // Simulado para demo
  }));

  res.json(formattedCalls);
});

// @desc    Obtener balance y transacciones recientes
// @route   GET /api/reports/financial
// @access  Private
const getFinancialReport = asyncHandler(async (req, res) => {
  // Obtener usuario con balance
  const user = await User.findById(req.user._id).select('balance');

  // Obtener transacciones recientes
  const recentTransactions = await Transaction.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .limit(5);

  // Calcular gastos totales
  const totalCharges = await Transaction.aggregate([
    {
      $match: {
        user: req.user._id,
        type: 'charge',
      },
    },
    {
      $group: {
        _id: null,
        total: { $sum: '$amount' },
      },
    },
  ]);

  // Calcular recargas totales
  const totalDeposits = await Transaction.aggregate([
    {
      $match: {
        user: req.user._id,
        type: 'deposit',
      },
    },
    {
      $group: {
        _id: null,
        total: { $sum: '$amount' },
      },
    },
  ]);

  res.json({
    currentBalance: user.balance,
    recentTransactions,
    totalSpent: totalCharges.length > 0 ? Math.abs(totalCharges[0].total) : 0,
    totalDeposited: totalDeposits.length > 0 ? totalDeposits[0].total : 0,
  });
});

module.exports = {
  getStats,
  getCallsByDay,
  getRecentCalls,
  getFinancialReport,
};