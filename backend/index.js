const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const morgan = require('morgan');
const path = require('path');
const { notFound, errorHandler } = require('./middlewares/errorMiddleware');

// Cargar variables de entorno
dotenv.config();

// Inicializar Express
const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging en desarrollo
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Carpeta para archivos temporales
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Asegurarse de que existe la carpeta uploads
const fs = require('fs');
if (!fs.existsSync('./uploads')) {
  fs.mkdirSync('./uploads');
}

// Rutas
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/balance', require('./routes/balanceRoutes'));
app.use('/api/campaigns', require('./routes/campaignRoutes'));
app.use('/api/leads', require('./routes/leadRoutes'));
app.use('/api/reports', require('./routes/reportRoutes'));

// Ruta de prueba
app.get('/', (req, res) => {
  res.send('API está funcionando correctamente');
});

// Middleware para manejar rutas no encontradas
app.use(notFound);

//importar stripe
app.use('/api/stripe', require('./routes/stripeRoutes'));

// Middleware para manejar errores
app.use(errorHandler);

// Puerto
const PORT = process.env.PORT || 5000;

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});