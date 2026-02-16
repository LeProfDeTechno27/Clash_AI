const axios = require('axios');
const assert = require('assert');

const API = process.env.API_BASE || 'http://localhost:5000';
const MAX_WAIT_MS = Number(process.env.MAX_WAIT_MS || 180000);
const POLL_MS = Number(process.env.POLL_MS || 2000);

async function sleep(ms){ return new Promise(r=>setTimeout(r, ms)); }

async function waitForStatus(id, targetStatuses) {
  const start = Date.now();
  while (Date.now() - start < MAX_WAIT_MS) {
    const r = await axios.get(`${API}/api/debates/${id}/status`);
    const s = (r.data.status || '').toLowerCase();
    if (targetStatuses.includes(s)) return s;
    await sleep(POLL_MS);
  }
  throw new Error(`Timeout waiting status in ${id}`);
}

async function waitForVideos(id, minCount=2) {
  const start = Date.now();
  while (Date.now() - start < MAX_WAIT_MS) {
    const r = await axios.get(`${API}/api/debates/${id}/videos`);
    if (Array.isArray(r.data) && r.data.length >= minCount) return r.data;
    await sleep(POLL_MS);
  }
  throw new Error(`Timeout waiting videos >= ${minCount}`);
}

(async () => {
  console.log('E2E n8n: base =', API);
  // Create debate triggers worker -> n8n webhook -> tools.
  const topic = 'E2E n8n ' + new Date().toISOString();
  const create = await axios.post(`${API}/api/debates`, { topic, duration_target: 12 }, { headers: { 'Content-Type':'application/json' } });
  assert.equal(create.status, 201);
  const id = create.data.id;
  console.log('Created debate id=', id);

  // Wait for audio then video status
  const s1 = await waitForStatus(id, ['audio','video','published']);
  console.log('Reached status:', s1);
  const s2 = await waitForStatus(id, ['video','published']);
  console.log('Reached status:', s2);

  // Wait for videos presence
  const vids = await waitForVideos(id, 2);
  console.log('Videos count:', vids.length);

  // Optionally simulate publish (TikTok)
  const pub = await axios.post(`${API}/api/videos/${vids[0].id}/publish`, { platform: 'tiktok' });
  assert.equal(pub.data.status, 'published');
  console.log('Publish simulated OK');

  console.log('E2E n8n: PASS');
})().catch(err => {
  console.error('E2E n8n: FAIL');
  if (err.response) console.error(err.response.status, err.response.data);
  else console.error(err.stack || err.message);
  process.exit(1);
});
