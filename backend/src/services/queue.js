const Queue = require('bull');

const debateQueue = new Queue('debates', {
  redis: { host: process.env.REDIS_HOST || 'redis', port: Number(process.env.REDIS_PORT || 6379) }
});

const publishQueue = new Queue('publish', {
  redis: { host: process.env.REDIS_HOST || 'redis', port: Number(process.env.REDIS_PORT || 6379) }
});

module.exports = { debateQueue, publishQueue };
