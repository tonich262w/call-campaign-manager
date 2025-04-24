const express = require('express');
const router = express.Router();
const {
  getStats,
  getCallsByDay,
  getRecentCalls,
  getFinancialReport,
} = require('../controllers/reportController');
const { protect } = require('../middlewares/authMiddleware');

// Todas las rutas requieren autenticación
router.use(protect);

router.get('/stats', getStats);
router.get('/calls-by-day', getCallsByDay);
router.get('/recent-calls', getRecentCalls);
router.get('/financial', getFinancialReport);

module.exports = router;