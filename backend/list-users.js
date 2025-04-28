// list-users.js
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/userModel');

async function listUsers() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    console.log('🟢 Conectado a MongoDB Atlas');
    
    // Listar todos los usuarios
    const users = await User.find({}, 'name email role');
    
    console.log(`Encontrados ${users.length} usuarios:`);
    
    users.forEach((user, index) => {
      console.log(`\nUsuario #${index + 1}:`);
      console.log('ID:', user._id);
      console.log('Nombre:', user.name);
      console.log('Email:', user.email);
      console.log('Rol:', user.role);
    });
    
    await mongoose.connection.close();
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

listUsers();