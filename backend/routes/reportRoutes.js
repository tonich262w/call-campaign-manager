// routes/reportRoutes.js
const express = require('express');
const router = express.Router();
const { 
  getStats, 
  getCallsByDay, 
  getRecentCalls, 
  getFinancialReport,
  getCampaignReport,
  getUserPerformanceReport,
  getSystemReport,
  getUsersReport
} = require('../controllers/reportController');
const { protect, admin } = require('../middlewares/authMiddleware');

// Ruta de prueba
router.get('/test', (req, res) => {
  res.json({ message: 'API de reportes funcionando correctamente' });
});

// Todas las rutas requieren autenticación
router.use(protect);

// Rutas generales
router.get('/stats', getStats);
router.get('/calls-by-day', getCallsByDay);
router.get('/recent-calls', getRecentCalls);
router.get('/financial', getFinancialReport);

// Reportes de campaña y rendimiento
router.get('/campaigns/:id', getCampaignReport);
router.get('/performance', getUserPerformanceReport);

// Rutas para administradores
router.get('/admin/system', admin, getSystemReport);
router.get('/admin/users', admin, getUsersReport);

module.exports = router;