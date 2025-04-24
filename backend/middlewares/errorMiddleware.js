// Middleware para manejar rutas no encontradas
const notFound = (req, res, next) => {
  const error = new Error(`No se encontró - ${req.originalUrl}`);
  res.status(404);
  next(error);
};
// Middleware para manejar errores
const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);
  res.json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
};

module.exports = { notFound, errorHandler };

