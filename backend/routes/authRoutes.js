const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/userModel');

// Middleware para verificar el estado de la conexión a MongoDB
const checkDbConnection = (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    console.error('Estado de conexión MongoDB:', mongoose.connection.readyState);
    return res.status(500).json({
      message: 'Error de conexión a la base de datos',
      details: 'La aplicación no puede conectarse a MongoDB actualmente',
      readyState: mongoose.connection.readyState
    });
  }
  next();
};

// Middleware para validar los datos del usuario
const validateUserData = (req, res, next) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ 
      message: 'Por favor proporciona email y contraseña' 
    });
  }
  
  // Normalizar el email
  req.body.email = email.toLowerCase().trim();
  
  next();
};

// Ruta de registro
router.post('/register', [checkDbConnection, validateUserData], async (req, res) => {
  try {
    const { email, password, name } = req.body;
    
    console.log('⏳ Intento de registro para:', email);
    
    // Verificar si el usuario ya existe
    const existingUser = await User.findOne({ email }).maxTimeMS(5000);
    if (existingUser) {
      console.log('⚠️ Email ya registrado:', email);
      return res.status(400).json({ message: 'Este email ya está registrado' });
    }
    
    // Hashear la contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Crear nuevo usuario
    const newUser = new User({
      name: name || email.split('@')[0], // Usar parte del email como nombre si no se proporciona
      email,
      password: hashedPassword,
      role: 'user' // Por defecto, asignamos rol de usuario
    });
    
    await newUser.save();
    console.log('✅ Usuario registrado correctamente:', email);
    
    // Generar token
    const token = jwt.sign(
      { id: newUser._id, role: newUser.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    res.status(201).json({
      message: 'Usuario registrado correctamente',
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role
      }
    });
  } catch (error) {
    console.error('❌ Error en registro:', error);
    res.status(500).json({
      message: 'Error en el registro',
      error: error.message
    });
  }
});

// Ruta de login
router.post('/login', [checkDbConnection, validateUserData], async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('⏳ Intento de login para:', email);
    console.log('📊 Estado de conexión MongoDB:', mongoose.connection.readyState);
    
    // Buscar usuario con timeout explícito
    console.log('🔍 Buscando usuario en la base de datos...');
    const user = await User.findOne({ email }).maxTimeMS(5000);
    
    // Verificar si el usuario existe
    if (!user) {
      console.log('❌ Usuario no encontrado:', email);
      return res.status(400).json({ message: 'Credenciales inválidas' });
    }
    
    console.log('✅ Usuario encontrado con ID:', user._id);
    
    // Verificar contraseña
    console.log('⏳ Comparando contraseñas...');
    const isMatch = await bcrypt.compare(password, user.password);
    
    console.log('Resultado de comparación:', isMatch ? '✅ Contraseña correcta' : '❌ Contraseña incorrecta');
    
    if (!isMatch) {
      return res.status(400).json({ message: 'Credenciales inválidas' });
    }
    
    // Generar token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    console.log('🔑 Token JWT generado correctamente para:', email);
    
    res.json({
      message: 'Login exitoso',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('❌ Error en login:', error);
    console.error('Tipo de error:', error.name);
    console.error('Mensaje:', error.message);
    console.error('Stack:', error.stack);
    
    // Manejo específico de errores MongoDB
    if (error.name === 'MongooseError' || error.name === 'MongoError') {
      return res.status(500).json({
        message: 'Error de conexión a la base de datos',
        details: error.message,
        type: 'database_error'
      });
    }
    
    res.status(500).json({
      message: 'Error en el servidor durante el login',
      error: error.message
    });
  }
});

// Ruta para verificar token (útil para mantener sesión activa)
router.get('/verify-token', async (req, res) => {
  try {
    // Obtener token de x-auth-token o Authorization header
    let token = req.header('x-auth-token');
    
    // Si no hay token en x-auth-token, buscar en Authorization
    if (!token) {
      const authHeader = req.header('Authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7); // Extraer el token después de 'Bearer '
        console.log('Token obtenido de Authorization header');
      }
    } else {
      console.log('Token obtenido de x-auth-token header');
    }
    
    if (!token) {
      console.log('No se encontró token en ninguna cabecera');
      return res.status(401).json({ message: 'No hay token, autorización denegada' });
    }
    
    try {
      console.log('Verificando token JWT...');
      // Verificar si el token es válido
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('Token válido para usuario ID:', decoded.id);
      
      // Verificar si el usuario existe en la base de datos
      const user = await User.findById(decoded.id).select('-password').maxTimeMS(5000);
      
      if (!user) {
        console.log('Usuario no encontrado en la base de datos');
        return res.status(400).json({ message: 'Token inválido, usuario no existe' });
      }
      
      console.log('Verificación de token exitosa para:', user.email);
      res.json({
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      });
    } catch (err) {
      console.error('Error al verificar token:', err);
      
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Token expirado' });
      }
      
      return res.status(401).json({ message: 'Token inválido' });
    }
  } catch (error) {
    console.error('Error en verificación de token:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

// Ruta para cambiar contraseña
router.post('/change-password', [checkDbConnection], async (req, res) => {
  try {
    const { email, currentPassword, newPassword } = req.body;
    
    if (!email || !currentPassword || !newPassword) {
      return res.status(400).json({ 
        message: 'Todos los campos son requeridos' 
      });
    }
    
    // Buscar usuario
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    
    if (!user) {
      return res.status(400).json({ message: 'Usuario no encontrado' });
    }
    
    // Verificar contraseña actual
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    
    if (!isMatch) {
      return res.status(400).json({ message: 'Contraseña actual incorrecta' });
    }
    
    // Hashear nueva contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    // Actualizar contraseña
    user.password = hashedPassword;
    await user.save();
    
    res.json({ message: 'Contraseña actualizada correctamente' });
  } catch (error) {
    console.error('Error al cambiar contraseña:', error);
    res.status(500).json({ 
      message: 'Error en el servidor', 
      error: error.message 
    });
  }
});

// Middleware para proteger rutas (requiere autenticación)
const auth = (req, res, next) => {
  // Obtener token de x-auth-token o Authorization header
  let token = req.header('x-auth-token');
  
  // Si no hay token en x-auth-token, buscar en Authorization
  if (!token) {
    const authHeader = req.header('Authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7); // Extraer el token después de 'Bearer '
      console.log('Token obtenido de Authorization header');
    }
  } else {
    console.log('Token obtenido de x-auth-token header');
  }
  
  if (!token) {
    console.log('No se encontró token en ninguna cabecera');
    return res.status(401).json({ message: 'No hay token, autorización denegada' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    console.error('Error al verificar token en middleware auth:', err);
    res.status(401).json({ message: 'Token inválido' });
  }
};

// Middleware para verificar rol de administrador
const admin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Acceso denegado, se requiere rol de administrador' });
  }
  next();
};

// Ruta protegida para obtener perfil
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Error al obtener perfil:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

// Ruta de administración para listar usuarios (solo admin)
router.get('/users', [auth, admin], async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    console.error('Error al listar usuarios:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

module.exports = router;