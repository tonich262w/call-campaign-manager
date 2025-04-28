// makeUserAdmin.js
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/userModel');

// Verificar variables de entorno
if (!process.env.MONGODB_URI) {
  console.error('Error: MONGODB_URI no está definida en las variables de entorno');
  process.exit(1);
}

const adminEmail = 'admin@example.com';

// Conectar a MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('Conexión a MongoDB establecida correctamente');
    
    try {
      // Buscar el usuario
      const user = await User.findOne({ email: adminEmail });
      
      if (!user) {
        console.log(`No se encontró ningún usuario con email ${adminEmail}`);
        process.exit(1);
      }
      
      // Mostrar información actual
      console.log('Información actual del usuario:');
      console.log(`- Nombre: ${user.name}`);
      console.log(`- Email: ${user.email}`);
      console.log(`- Rol: ${user.role}`);
      console.log(`- Activo: ${user.isActive}`);
      
      // Actualizar a rol de administrador
      user.role = 'admin';
      await user.save();
      
      console.log('\nUsuario actualizado con éxito:');
      console.log(`- Nombre: ${user.name}`);
      console.log(`- Email: ${user.email}`);
      console.log(`- Rol: ${user.role} (Actualizado a administrador)`);
      console.log(`- Activo: ${user.isActive}`);
      
    } catch (error) {
      console.error('Error al actualizar el usuario:', error);
    } finally {
      mongoose.disconnect();
    }
  })
  .catch(err => {
    console.error('Error al conectar con MongoDB:', err);
    process.exit(1);
  });
