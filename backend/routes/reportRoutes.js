// routes/reportRoutes.js
const express = require('express');
const router = express.Router();
const {
  // Funciones existentes
  getStats,
  getCallsByDay,
  getRecentCalls,
  getFinancialReport,
  
  // Nuevas funciones para informes más detallados
  getCampaignReport,
  getUserPerformanceReport,
  getSystemReport,
  getUsersReport
} = require('../controllers/reportController');
const { protect, admin } = require('../middlewares/authMiddleware');

// Todas las rutas requieren autenticación
router.use(protect);

// Rutas existentes
router.get('/stats', getStats);
router.get('/calls-by-day', getCallsByDay);
router.get('/recent-calls', getRecentCalls);
router.get('/financial', getFinancialReport);

// Nuevas rutas para informes más detallados
router.get('/campaigns/:id', getCampaignReport);
router.get('/performance', getUserPerformanceReport);

// Rutas para administradores
router.get('/admin/system', admin, getSystemReport);
router.get('/admin/users', admin, getUsersReport);

module.exports = router;