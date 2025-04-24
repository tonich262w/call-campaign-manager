const express = require('express');
const router = express.Router();
const {
  loginUser,
  registerUser,
  getUserProfile,
} = require('../controllers/authController');
const { protect } = require('../middlewares/authMiddleware');

// Rutas públicas
router.post('/login', loginUser);
router.post('/register', registerUser);

// Rutas protegidas
router.route('/profile').get(protect, getUserProfile);

module.exports = router;
