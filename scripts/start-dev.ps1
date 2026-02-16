param([switch]$Rebuild)
Write-Host 'Starting DEV stack (api, worker, web (Vite), db, redis, n8n, tts)...'
if ($Rebuild) { docker compose build }
docker compose up -d db redis api worker web n8n n8n-webhook tts
Write-Host 'DEV up. Front (dev): http://localhost:3000  API: http://localhost:5000'


