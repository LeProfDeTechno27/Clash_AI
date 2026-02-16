const client = require('prom-client');
const register = new client.Registry();
client.collectDefaultMetrics({ register });

const debatesCreated = new client.Counter({ name: 'debates_created_total', help: 'Total debates created' });
register.registerMetric(debatesCreated);

const httpDuration = new client.Histogram({ name: 'http_request_duration_seconds', help: 'HTTP request duration in seconds', buckets: [0.05, 0.1, 0.2, 0.5, 1, 2, 5] });
register.registerMetric(httpDuration);

module.exports = { client, register, debatesCreated, httpDuration };


