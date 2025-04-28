// createAdminUser.js
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/userModel');

// Verificar variables de entorno
if (!process.env.MONGODB_URI) {
  console.error('Error: MONGODB_URI no está definida en las variables de entorno');
  process.exit(1);
}

// Datos del usuario administrador
const adminUser = {
  name: 'Admin Principal',
  email: 'admin@example.com',
  password: 'admin123456',
  role: 'admin',
  isActive: true
};

// Conectar a MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('Conexión a MongoDB establecida correctamente');
    
    try {
      // Verificar si el usuario ya existe
      const existingUser = await User.findOne({ email: adminUser.email });
      
      if (existingUser) {
        console.log(`El usuario con email ${adminUser.email} ya existe`);
        process.exit(0);
      }
      
      // Encriptar la contraseña
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(adminUser.password, salt);
      
      // Crear el usuario
      const newUser = new User({
        name: adminUser.name,
        email: adminUser.email,
        password: hashedPassword,
        role: adminUser.role,
        isActive: adminUser.isActive
      });
      
      await newUser.save();
      console.log(`Usuario administrador creado con éxito: ${adminUser.email}`);
      console.log('Contraseña:', adminUser.password);
    } catch (error) {
      console.error('Error al crear el usuario administrador:', error);
    } finally {
      mongoose.disconnect();
    }
  })
  .catch(err => {
    console.error('Error al conectar con MongoDB:', err);
    process.exit(1);
  });
