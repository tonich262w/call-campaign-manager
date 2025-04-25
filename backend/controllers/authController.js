// controllers/authController.js
const asyncHandler = require('express-async-handler');
const generateToken = require('../utils/generateToken');
const User = require('../models/userModel');

// @desc    Autenticar usuario y obtener token
// @route   POST /api/auth/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      balance: user.balance,
      isAdmin: user.isAdmin,
      token: generateToken(user._id),
    });
  } else {
    res.status(401);
    throw new Error('Email o contraseña incorrectos');
  }
});

// @desc    Registrar un nuevo usuario
// @route   POST /api/auth/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, company, phone } = req.body;

  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400);
    throw new Error('El usuario ya existe');
  }

  const user = await User.create({
    name,
    email,
    password,
    company,
    phone,
  });

  if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isAdmin: user.isAdmin,
      balance: user.balance,
      token: generateToken(user._id),
    });
  } else {
    res.status(400);
    throw new Error('Datos de usuario inválidos');
  }
});

// @desc    Obtener perfil de usuario
// @route   GET /api/auth/profile
// @access  Private
const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isAdmin: user.isAdmin,
      balance: user.balance,
      company: user.company,
      phone: user.phone,
    });
  } else {
    res.status(404);
    throw new Error('Usuario no encontrado');
  }
});

// @desc    Verificar si el token es válido
// @route   GET /api/auth/verify
// @access  Public
const verifyToken = asyncHandler(async (req, res) => {
  try {
    // El middleware "protect" ya verifica y decodifica el token
    // Si llegamos aquí, el token es válido
    
    // Obtener el usuario sin la contraseña
    const user = await User.findById(req.user._id).select('-password');
    
    if (user) {
      res.json({
        success: true,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          isAdmin: user.isAdmin
        }
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Token inválido'
    });
  }
});

module.exports = {
  loginUser,
  registerUser,
  getUserProfile,
  verifyToken
};