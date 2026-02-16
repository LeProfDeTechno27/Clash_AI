const express = require('express');
const cors = require('cors');
const compression = require('compression');
const dotenv = require('dotenv');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const logger = require('./middleware/logger');
const errorHandler = require('./middleware/errorHandler');

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const app = express();
app.use(helmet());
app.use(require('./middleware/requestId'));
app.use(require('./middleware/timing'));
app.use(cors({ origin: process.env.CORS_ORIGIN ? new RegExp(process.env.CORS_ORIGIN) : '*' }));
app.use(express.json({ limit: process.env.JSON_LIMIT || '1mb' }));
app.use(logger);
app.use(compression());

const { register } = require('./metrics');
const db = require('./db/connection');
const redisClient = require('./services/redisClient');

const limiter = rateLimit({ windowMs: 60 * 1000, max: 120 });
app.use(limiter);

app.get('/health', async (req, res) => {
  const health = { status: 'ok', service: 'api', time: new Date().toISOString(), deps: {} };
  try { const [row] = await db.query('SELECT 1 AS ok'); health.deps.db = row ? 'up' : 'down'; } catch { health.deps.db = 'down'; health.status = 'degraded'; }
  try { await redisClient.ping(); health.deps.redis = 'up'; } catch { health.deps.redis = 'down'; health.status = 'degraded'; }
  res.json(health);
});

app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

app.use('/api/debates', require('./api/debates'));
app.use('/api/videos', require('./api/videos'));
app.use('/api/analytics', require('./api/analytics'));
app.use('/tools', require('./api/tools'));
app.use('/webhooks/n8n', require('./webhooks/n8n'));

// Optional static serving for production (serve /public)
if (process.env.STATIC_FRONTEND === 'true') {
  const publicDir = path.resolve(process.cwd(), 'public');
  app.use(express.static(publicDir));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/webhooks') || req.path.startsWith('/metrics')) return next();
    const indexPath = path.join(publicDir, 'index.html');
    return res.sendFile(indexPath, (err) => err ? next() : undefined);
  });
}

app.use(errorHandler);

const http = require('http');
const server = http.createServer(app);
const { init } = require('./realtime/io');
init(server);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`[api] listening on port ${PORT}`);
});
