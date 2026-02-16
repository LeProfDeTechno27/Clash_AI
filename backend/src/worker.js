const { debateQueue, publishQueue } = require('./services/queue');
const { triggerDebateStart } = require('./services/n8n');
const publisher = require('./services/publisher');

async function processDebate(job) {
  const id = job.data.debate_id;
  const topic = job.data.topic;
  await triggerDebateStart({ debate_id: id, topic });
  return { ok: true };
}

async function processPublish(job) {
  const videoId = job.data.video_id;
  const platform = job.data.platform || 'youtube';
  return await publisher.publish(videoId, platform);
}

debateQueue.process(async (job) => { return await processDebate(job); });
publishQueue.process(async (job) => { return await processPublish(job); });

console.log('[worker] listening for jobs');


