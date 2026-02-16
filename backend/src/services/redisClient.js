const { createClient } = require('redis');
const client = createClient({ url: `redis://${process.env.REDIS_HOST || 'redis'}:${process.env.REDIS_PORT || 6379}` });
client.on('error', (err) => console.error('[redis] error', err));
(async () => { try { await client.connect(); } catch (e) { console.error('[redis] connect failed', e); } })();
module.exports = client;
