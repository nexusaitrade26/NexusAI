export const errorHandler = (err, req, res, next) => {
  console.error('API Error:', err);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Errore interno del server';

  res.status(statusCode).json({
    error: message,
    status: statusCode
  });
};
