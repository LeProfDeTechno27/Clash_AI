const client = require('./redisClient');

async function getJSON(key) {
  const v = await client.get(key);
  return v ? JSON.parse(v) : null;
}
async function setJSON(key, obj, ttlSeconds) {
  const payload = JSON.stringify(obj);
  if (ttlSeconds) {
    await client.setEx(key, ttlSeconds, payload);
  } else {
    await client.set(key, payload);
  }
}
module.exports = { getJSON, setJSON };
