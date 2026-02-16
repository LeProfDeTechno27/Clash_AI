const fs = require('fs');
const path = require('path');
const axios = require('axios');

(async () => {
  const base = process.env.N8N_BASE_URL || 'http://localhost:5678';
  const apiKey = process.env.N8N_API_KEY || '';
  const headers = { 'Content-Type': 'application/json' };
  if (apiKey) headers['X-N8N-API-KEY'] = apiKey;
  const dir = path.resolve(__dirname, '../n8n/workflows');
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.json'));
  for (const f of files) {
    const body = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
    const res = await axios.post(`${base}/api/v1/workflows`, body, { headers });
    console.log('Imported', f, '=> id', res.data?.id);
  }
})().catch(e => { console.error(e.response?.data || e.message); process.exit(1); });

