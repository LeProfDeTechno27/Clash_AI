const { httpDuration } = require('../metrics');

module.exports = (req, res, next) => {
  const start = process.hrtime.bigint();
  res.on('finish', () => {
    try {
      const end = process.hrtime.bigint();
      const durMs = Number(end - start) / 1e6;
      httpDuration.observe(durMs / 1000); // seconds
    } catch {}
  });
  next();
};
