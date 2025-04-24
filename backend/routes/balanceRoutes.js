const express = require('express');
const router = express.Router();
const {
  getUserBalance,
  addBalance,
  getTransactions,
} = require('../controllers/balanceController');
const { protect } = require('../middlewares/authMiddleware');

// Todas las rutas requieren autenticación
router.use(protect);

router.get('/', getUserBalance);
router.post('/add', addBalance);
router.get('/transactions', getTransactions);

module.exports = router;