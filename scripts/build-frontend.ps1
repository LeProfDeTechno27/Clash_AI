Write-Host 'Building frontend via Docker (node:18-alpine)...'
$frontendPath = Resolve-Path (Join-Path $PSScriptRoot '../frontend')
docker run --rm -v "$frontendPath":/app -w /app node:18-alpine sh -lc "npm ci && npm run build"
Write-Host 'Done. Dist is in frontend/dist.'
