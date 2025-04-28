// resetAdminPassword.js
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/userModel');

// Verificar variables de entorno
if (!process.env.MONGODB_URI) {
  console.error('Error: MONGODB_URI no está definida en las variables de entorno');
  process.exit(1);
}

// Nueva contraseña para el administrador
const newPassword = 'Admin@2025';
const adminEmail = 'admin@example.com';

// Conectar a MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('Conexión a MongoDB establecida correctamente');
    
    try {
      // Buscar el usuario administrador
      const adminUser = await User.findOne({ email: adminEmail });
      
      if (!adminUser) {
        console.log(`No se encontró ningún usuario con email ${adminEmail}`);
        process.exit(1);
      }
      
      // Encriptar la nueva contraseña
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);
      
      // Actualizar la contraseña
      adminUser.password = hashedPassword;
      await adminUser.save();
      
      console.log(`Contraseña actualizada con éxito para: ${adminEmail}`);
      console.log('Nueva contraseña:', newPassword);
    } catch (error) {
      console.error('Error al actualizar la contraseña:', error);
    } finally {
      mongoose.disconnect();
    }
  })
  .catch(err => {
    console.error('Error al conectar con MongoDB:', err);
    process.exit(1);
  });
