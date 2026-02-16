param([switch]$Rebuild)
Write-Host 'Building frontend dist via Docker (node:18-alpine)...'
$frontendPath = Resolve-Path (Join-Path $PSScriptRoot '../frontend')
docker run --rm -v "$frontendPath":/app -w /app node:18-alpine sh -lc "npm ci && npm run build"

# Ensure STATIC_FRONTEND=true in backend/.env.local
$envPath = Resolve-Path (Join-Path $PSScriptRoot '../backend/.env.local')
if (Test-Path $envPath) {
  $envTxt = Get-Content $envPath -Raw
  if ($envTxt -match '^STATIC_FRONTEND=') {
    $envTxt = [regex]::Replace($envTxt, '^STATIC_FRONTEND=.*', 'STATIC_FRONTEND=true', 'Multiline')
  } else {
    $envTxt += "`nSTATIC_FRONTEND=true`n"
  }
  Set-Content -Path $envPath -Value $envTxt -Encoding UTF8
} else {
  Set-Content -Path $envPath -Value "STATIC_FRONTEND=true`n" -Encoding UTF8
}

Write-Host 'Starting PROD stack (api serves /public), worker, db, redis, n8n, tts, and web-prod (Nginx)...'
if ($Rebuild) { docker compose build api worker web-prod }
docker compose up -d db redis api worker n8n n8n-webhook tts web-prod
Write-Host 'PROD up. Front (Nginx): http://localhost:8080  API static: http://localhost:5000'


