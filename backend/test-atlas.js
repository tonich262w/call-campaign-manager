// test-atlas.js
require('dotenv').config();
const mongoose = require('mongoose');

async function testAtlasConnection() {
  console.log('===== TEST DE CONEXIÓN A MONGODB ATLAS =====');
  
  if (!process.env.MONGODB_URI) {
    console.error('❌ ERROR: No se encontró la variable MONGODB_URI en el archivo .env');
    console.log('Por favor, crea un archivo .env con tu cadena de conexión de MongoDB Atlas');
    return;
  }
  
  console.log('Intentando conectar a MongoDB Atlas...');
  
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    console.log('🟢 CONEXIÓN EXITOSA A MONGODB ATLAS');
    console.log('Base de datos:', mongoose.connection.db.databaseName);
    
    // Listar colecciones para verificar acceso completo
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log(`Colecciones disponibles (${collections.length}):`, 
      collections.map(c => c.name).join(', '));
    
    await mongoose.connection.close();
    console.log('Conexión cerrada correctamente');
  } catch (error) {
    console.error('❌ ERROR DE CONEXIÓN A ATLAS:', error.message);
    
    // Diagnóstico específico para errores comunes de Atlas
    if (error.message.includes('Authentication failed')) {
      console.log('\nEl problema parece ser de autenticación. Verifica:');
      console.log('- Usuario y contraseña correctos en la cadena de conexión');
      console.log('- El usuario tiene permisos para acceder a esta base de datos');
    } else if (error.message.includes('timed out')) {
      console.log('\nLa conexión ha agotado el tiempo de espera. Verifica:');
      console.log('- Tu conexión a internet');
      console.log('- Si has configurado las IPs permitidas en Atlas (Network Access)');
    }
  }
}

testAtlasConnection();