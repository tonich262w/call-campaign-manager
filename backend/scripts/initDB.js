// scripts/initDB.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const User = require('../models/userModel');
const { Pricing } = require('../models/balanceModel');

// Cargar variables de entorno
dotenv.config();

// Conectar a MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB conectado...'))
  .catch(err => {
    console.error('Error de conexión a MongoDB:', err);
    process.exit(1);
  });

// Función para inicializar la base de datos
const initializeDB = async () => {
  try {
    // Verificar si ya existe un usuario administrador
    const adminExists = await User.findOne({ isAdmin: true });
    
    if (!adminExists) {
      // Crear un usuario administrador
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('admin123', salt);
      
      const admin = await User.create({
        name: 'Administrador',
        email: 'admin@example.com',
        password: hashedPassword,
        isAdmin: true,
        company: 'Tu Empresa',
        phone: '+1234567890'
      });
      
      console.log('Usuario administrador creado:', admin.email);
    } else {
      console.log('Usuario administrador ya existe:', adminExists.email);
    }
    
    // Verificar si ya existe una configuración de precios
    const pricingExists = await Pricing.findOne({ active: true });
    
    if (!pricingExists) {
      // Crear configuración de precios inicial
      const pricing = await Pricing.create({
        callRate: 0.10, // Precio mostrado al cliente (inflado)
        callMinuteRate: 0.02, // Precio por minuto mostrado al cliente
        realCallRate: 0.05, // Costo real en Voximplant (oculto)
        realCallMinuteRate: 0.01, // Costo real por minuto (oculto)
        inflationRate: 2.0, // Factor de inflación (2 = doble de costo)
        minRechargeAmount: 10.0,
        active: true
      });
      
      console.log('Configuración de precios creada:', pricing);
    } else {
      console.log('Configuración de precios ya existe:', pricingExists);
    }
    
    console.log('Base de datos inicializada correctamente');
    process.exit(0);
  } catch (error) {
    console.error('Error al inicializar la base de datos:', error);
    process.exit(1);
  }
};

// Ejecutar la inicialización
initializeDB();