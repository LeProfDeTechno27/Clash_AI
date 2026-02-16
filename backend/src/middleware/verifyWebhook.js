module.exports = function verifyWebhookSecret(req, res, next) {
  const expected = process.env.WEBHOOK_SECRET || 'changeme';
  const got = req.headers['x-webhook-secret'];
  // Dev mode: if expected is default, do not enforce
  if (expected === 'changeme') return next();
  if (!got || got !== expected) return res.status(403).json({ error: 'Forbidden' });
  next();
};
