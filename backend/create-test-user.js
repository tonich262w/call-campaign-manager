// create-test-user.js
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/userModel'); // Ajusta la ruta según tu estructura

async function createTestUser() {
  try {
    // Conectar a MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    console.log('🟢 Conectado a MongoDB Atlas');
    
    // Verificar si ya existe el usuario
    const existingUser = await User.findOne({ email: 'test@example.com' });
    
    if (existingUser) {
      console.log('⚠️ El usuario de prueba ya existe');
      console.log('Email:', existingUser.email);
      console.log('ID:', existingUser._id);
      
      // Actualizar la contraseña
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('password123', salt);
      
      existingUser.password = hashedPassword;
      await existingUser.save();
      
      console.log('✅ Contraseña actualizada correctamente');
    } else {
      // Crear un nuevo usuario
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('password123', salt);
      
      const newUser = new User({
        name: 'Usuario de Prueba',
        email: 'test@example.com',
        password: hashedPassword,
        role: 'user'
      });
      
      await newUser.save();
      
      console.log('✅ Usuario de prueba creado exitosamente');
      console.log('Email: test@example.com');
      console.log('Contraseña: password123');
      console.log('ID:', newUser._id);
    }
    
    await mongoose.connection.close();
    console.log('Conexión cerrada');
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

createTestUser();