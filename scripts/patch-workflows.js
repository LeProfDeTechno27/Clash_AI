const fs = require('fs');
const path = require('path');

function patchFile(p){
  const raw = fs.readFileSync(p,'utf8');
  const data = JSON.parse(raw);
  let changed = 0;
  for (const n of data.nodes || []){
    const params = n.parameters || {};
    if (typeof params.url === 'string' && params.url.includes('/webhooks/n8n/')){
      if (!('sendHeaders' in params)) { params.sendHeaders = true; changed++; }
      params.headerParametersJson = JSON.stringify({ 'x-webhook-secret': 'changeme' });
    }
  }
  if (changed){ fs.writeFileSync(p, JSON.stringify(data, null, 2)); }
  return changed;
}

const dir = path.resolve(__dirname, '../n8n/workflows');
const files = fs.readdirSync(dir).filter(f=>f.endsWith('.json'));
for (const f of files){
  const p = path.join(dir, f);
  const c = patchFile(p);
  if (c) console.log('Patched', f, 'nodes:', c);
}
