// app.js o server.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

// Importar rutas
const authRoutes = require('./routes/authRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const campaignRoutes = require('./routes/campaignRoutes');
const leadRoutes = require('./routes/leadRoutes');
const balanceRoutes = require('./routes/balanceRoutes');
const reportRoutes = require('./routes/reportRoutes');
const userRoutes = require('./routes/userRoutes');

console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'Definida (correcto)' : 'No definida (error)');
// Otros imports...

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Conexión a MongoDB - IMPORTANTE: establece la conexión antes de definir las rutas
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 15000
})
.then(() => {
  console.log(' Conexión a MongoDB Atlas establecida correctamente');
  
  // Rutas - definidas DESPUÉS de establecer la conexión
  app.use('/api/auth', authRoutes);
  app.use('/api/dashboard', dashboardRoutes);
  app.use('/api/campaigns', campaignRoutes);
  app.use('/api/leads', leadRoutes);
  app.use('/api/balance', balanceRoutes);
  app.use('/api/reports', reportRoutes);
  app.use('/api/users', userRoutes);
  
  // Crear directorio de uploads si no existe
  const uploadsDir = path.join(__dirname, 'uploads');
  if (!require('fs').existsSync(uploadsDir)) {
    require('fs').mkdirSync(uploadsDir);
  }
  
  // Iniciar servidor DESPUÉS de conectar a MongoDB
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Servidor ejecutándose en puerto ${PORT}`);
  });
})
.catch(err => {
  console.error('❌ Error al conectar a MongoDB:', err.message);
});