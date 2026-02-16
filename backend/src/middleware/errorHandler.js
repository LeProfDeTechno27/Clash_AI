module.exports = (err, req, res, next) => {
  const status = err.isJoi ? 400 : (err.status || 500);
  const message = err.isJoi ? err.details?.[0]?.message : (err.message || 'Internal Server Error');
  if (status >= 500) console.error(err);
  res.status(status).json({ error: message });
};
