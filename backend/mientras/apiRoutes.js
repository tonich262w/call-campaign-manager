// routes/balanceRoutes.js
const express = require('express');
const { protect, admin } = require('../middlewares/authMiddleware');
const {
  getUserBalance,
  getTransactionHistory,
  rechargeBalance,
  checkSufficientBalance,
  getAdminTransactions,
  updatePricing,
  addBalanceManually,
  getFinancialSummary
} = require('../controllers/balanceController');

const router = express.Router();

// Rutas para usuarios normales
router.get('/info', protect, getUserBalance);
router.get('/transactions', protect, getTransactionHistory);
router.post('/recharge', protect, rechargeBalance);
router.post('/check-balance', protect, checkSufficientBalance);

// Rutas solo para administradores
router.get('/admin/transactions', protect, admin, getAdminTransactions);
router.post('/admin/pricing', protect, admin, updatePricing);
router.post('/admin/manual-recharge', protect, admin, addBalanceManually);
router.get('/admin/summary', protect, admin, getFinancialSummary);

module.exports = router;

// routes/campaignRoutes.js
const express = require('express');
const { protect } = require('../middlewares/authMiddleware');
const {
  getCampaigns,
  getCampaignById,
  createCampaign,
  pauseCampaign,
  resumeCampaign,
  deleteCampaign,
  importLeads,
  voximplantWebhook
} = require('../controllers/campaignController');

const router = express.Router();

// Rutas protegidas
router.get('/', protect, getCampaigns);
router.get('/:id', protect, getCampaignById);
router.post('/', protect, createCampaign);
router.put('/:id/pause', protect, pauseCampaign);
router.put('/:id/resume', protect, resumeCampaign);
router.delete('/:id', protect, deleteCampaign);
router.post('/:id/import-leads', protect, importLeads);

// Webhook de Voximplant (ruta no protegida pero con validación interna)
router.post('/webhook', voximplantWebhook);

module.exports = router;

// routes/leadRoutes.js
const express = require('express');
const { protect } = require('../middlewares/authMiddleware');
const {
  updateLeadStatus
} = require('../controllers/campaignController');

const router = express.Router();

router.put('/:leadId/status', protect, updateLeadStatus);

module.exports = router;

// routes/reportRoutes.js
const express = require('express');
const { protect, admin } = require('../middlewares/authMiddleware');
const reportController = require('../controllers/reportController');

const router = express.Router();

// Rutas para los usuarios
router.get('/campaigns/:id', protect, reportController.getCampaignReport);
router.get('/performance', protect, reportController.getUserPerformanceReport);

// Rutas para administradores
router.get('/admin/system', protect, admin, reportController.getSystemReport);
router.get('/admin/users', protect, admin, reportController.getUsersReport);

module.exports = router;

// middlewares/authMiddleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

// Middleware para proteger rutas
const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Obtener token del header
      token = req.headers.authorization.split(' ')[1];

      // Verificar token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Obtener usuario y excluir password
      req.user = await User.findById(decoded.id).select('-password');

      next();
    } catch (error) {
      console.error('Error en autenticación:', error);
      res.status(401).json({ message: 'No autorizado, token inválido' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'No autorizado, no hay token' });
  }
};

// Middleware para verificar si es admin
const admin = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    res.status(403).json({ message: 'No autorizado como administrador' });
  }
};

module.exports = { protect, admin };

// middlewares/errorMiddleware.js
const notFound = (req, res, next) => {
  const error = new Error(`No encontrado - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);
  res.json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
};

module.exports = { notFound, errorHandler };
