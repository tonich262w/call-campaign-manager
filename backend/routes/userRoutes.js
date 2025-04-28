// routes/userRoutes.js
const express = require('express');
const { protect, admin } = require('../middlewares/authMiddleware');
const {
  getAllUsers,
  getUserDetails,
  createUser,
  updateUser,
  deleteUser,
  getUserStats
} = require('../controllers/userController');

const router = express.Router();

// Todas las rutas requieren autenticación y permisos de administrador
router.use(protect);
router.use(admin);

// Rutas de administración de usuarios
router.get('/', getAllUsers);
router.get('/stats', getUserStats);
router.get('/:userId', getUserDetails);
router.post('/', createUser);
router.put('/:userId', updateUser);
router.delete('/:userId', deleteUser);

module.exports = router;
