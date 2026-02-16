const axios = require('axios');

async function runViaPublicApi(base, payload) {
  const key = process.env.N8N_API_KEY;
  const wfId = process.env.N8N_DEBATE_WORKFLOW_ID; // optional
  if (!key || !wfId) return null;
  const headers = { 'X-N8N-API-KEY': key, 'Content-Type': 'application/json' };
  const bodies = [
    { url: `${base}/api/v1/workflows/${wfId}/run`, body: { payload } },
    { url: `${base}/api/v1/workflows/${wfId}/execute`, body: { payload } }
  ];
  for (const { url, body } of bodies) {
    try {
      const res = await axios.post(url, body, { headers, timeout: 15000 });
      const id = res?.data?.id || res?.data?.executionId || 'api';
      return { executionId: String(id) };
    } catch (e) {
      // try next
    }
  }
  return null;
}

async function runViaWebhook(base, payload) {
  try {
    const url = `${base}/webhook/debate-start`;
    const res = await axios.post(url, payload, { timeout: 15000 });
    const execId = res?.headers?.['x-execution-id'] || 'sim';
    return { executionId: execId };
  } catch (e) { return null; }
}

async function runDirectFallback(payload = {}) {
  const api = process.env.DIRECT_API_BASE || 'http://api:5000';
  const debate_id = payload?.debate_id || payload?.id;
  if (!debate_id) return { error: 'debate_id missing' };
  try {
    await axios.post(`${api}/tools/tts/batch`, { debate_id, duration: 8 }, { timeout: 60000 });
    await axios.post(`${api}/webhooks/n8n/audio-complete`, { debate_id }, { timeout: 10000 });
    await axios.post(`${api}/tools/video/generate`, { debate_id, width: 1280, height: 720 }, { timeout: 240000 });
    await axios.post(`${api}/tools/video/segment`, { debate_id }, { timeout: 60000 });
    await axios.post(`${api}/webhooks/n8n/video-complete`, { debate_id }, { timeout: 10000 });
    return { executionId: 'direct-fallback' };
  } catch (e) {
    return { error: e?.response?.data || e.message };
  }
}

async function triggerDebateStart(payload = {}) {
  const base = process.env.N8N_BASE_URL || 'http://n8n:5678';
  try { const viaApi = await runViaPublicApi(base, payload); if (viaApi) return viaApi; } catch {}
  const viaHook = await runViaWebhook(base, payload); if (viaHook) return viaHook;
  return await runDirectFallback(payload);
}

module.exports = { triggerDebateStart };
