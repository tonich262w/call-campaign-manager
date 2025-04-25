// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const {
  loginUser,
  registerUser,
  getUserProfile,
  verifyToken // Nueva función para verificar token
} = require('../controllers/authController');
const { protect } = require('../middlewares/authMiddleware');

// Rutas públicas
router.post('/login', loginUser);
router.post('/register', registerUser);

// Ruta para verificar token (añadida)
router.get('/verify', verifyToken);

// Rutas protegidas
router.route('/profile').get(protect, getUserProfile);

module.exports = router;