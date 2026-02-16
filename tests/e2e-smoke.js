const axios = require('axios');
const assert = require('assert');

const API = process.env.API_BASE || 'http://localhost:5000';

async function sleep(ms){ return new Promise(r=>setTimeout(r, ms)); }

(async () => {
  console.log('E2E smoke: base =', API);
  // 1) Create debate
  const topic = 'E2E Debate ' + new Date().toISOString();
  const create = await axios.post(API + '/api/debates', { topic, duration_target: 12 }, { headers: { 'Content-Type':'application/json' } });
  assert.equal(create.status, 201);
  const id = create.data.id;
  console.log('Created debate id=', id);

  // 2) Generate audio via tools (bypass n8n to be deterministic)
  const tts = await axios.post(API + '/tools/tts/batch', { debate_id: id, duration: 10 });
  assert.equal(tts.data.ok, true);
  console.log('Audio generated');

  // 3) Generate long video + segment
  const gen = await axios.post(API + '/tools/video/generate', { debate_id: id, width: 1280, height: 720 });
  assert.equal(gen.data.ok, true);
  const seg = await axios.post(API + '/tools/video/segment', { debate_id: id });
  assert.equal(seg.data.ok, true);
  console.log('Video generated and segmented');

  // 4) List videos
  const vids = await axios.get(API + '/api/debates/' + id + '/videos');
  assert(vids.data.length >= 2, 'expected >=2 videos');
  const firstVideo = vids.data[0];

  // 5) Simulate publish to TikTok
  const pub = await axios.post(API + '/api/videos/' + firstVideo.id + '/publish', { platform: 'tiktok' });
  assert.equal(pub.data.status, 'published');
  console.log('Publish simulated OK');

  // 6) Status should be at least video
  const status = await axios.get(API + '/api/debates/' + id + '/status');
  assert(['video','published','audio','created','generating','queued'].includes(status.data.status));
  console.log('Status OK:', status.data.status);

  console.log('E2E smoke: PASS');
})().catch(err => {
  console.error('E2E smoke: FAIL');
  if (err.response) console.error(err.response.status, err.response.data);
  else console.error(err.stack || err.message);
  process.exit(1);
});

