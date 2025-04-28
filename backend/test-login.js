// test-login.js
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/userModel');

async function testSpecificLogin() {
  try {
    // Conectar a MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    console.log('Conectado a MongoDB Atlas');
    
    // Email y contraseña de prueba (usa los mismos que intentas en la aplicación)
    const testEmail = 'luis@ejemplo.com';
    const testPassword = 'ejemplo';
    
    console.log(`Probando login para: ${testEmail}`);
    
    // Buscar el usuario
    const user = await User.findOne({ email: testEmail });
    
    if (!user) {
      console.log('❌ Usuario NO ENCONTRADO en la base de datos');
      console.log('Creando usuario de prueba...');
      
      // Crear usuario de prueba
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(testPassword, salt);
      
      const newUser = new User({
        name: 'Luis Test',
        email: testEmail,
        password: hashedPassword,
        role: 'user'
      });
      
      await newUser.save();
      console.log('✅ Usuario creado exitosamente con ID:', newUser._id);
      console.log('Por favor, intenta iniciar sesión nuevamente en la aplicación');
    } else {
      console.log('✅ Usuario ENCONTRADO con ID:', user._id);
      console.log('Hash de contraseña almacenado:', user.password);
      
      // Probar la comparación de contraseñas
      const isMatch = await bcrypt.compare(testPassword, user.password);
      console.log('Resultado de la comparación de contraseñas:', isMatch ? '✅ CORRECTA' : '❌ INCORRECTA');
      
      if (!isMatch) {
        console.log('Actualizando contraseña para este usuario...');
        
        // Actualizar contraseña
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(testPassword, salt);
        
        user.password = hashedPassword;
        await user.save();
        
        console.log('✅ Contraseña actualizada correctamente');
        console.log('Por favor, intenta iniciar sesión nuevamente en la aplicación');
      } else {
        console.log('La contraseña es correcta pero sigues teniendo problemas de login.');
        console.log('Esto podría indicar un problema en el proceso de autenticación o en el manejo del token JWT.');
      }
    }
    
    await mongoose.connection.close();
    
  } catch (error) {
    console.error('Error durante la prueba:', error);
  }
}

testSpecificLogin();