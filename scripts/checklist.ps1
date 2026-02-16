param(
  [string]$ApiBase = 'http://localhost:5000',
  [string]$N8nBase = 'http://localhost:5678',
  [string]$TtsBase = 'http://localhost:8010',
  [switch]$WithN8n,
  [string]$N8nApiKey
)
$ErrorActionPreference = 'Stop'

function Test-Url {
  param([string]$Url,[hashtable]$Headers)
  try {
    $r = Invoke-WebRequest -Uri $Url -Method GET -Headers $Headers -UseBasicParsing -TimeoutSec 10
    return @{ ok = $true; status = $r.StatusCode; body = $r.Content }
  } catch { return @{ ok = $false; err = $_.Exception.Message } }
}

Write-Host 'Checklist: API health...'
$h = Test-Url "$ApiBase/health" $null
if (-not $h.ok) { Write-Error "API health failed: $($h.err)"; exit 1 }
Write-Host "API /health => $($h.status)"

Write-Host 'Checklist: n8n workflows list...'
$headers = @{}
if ($N8nApiKey) { $headers['X-N8N-API-KEY'] = $N8nApiKey }
$n = Test-Url "$N8nBase/api/v1/workflows" $headers
if (-not $n.ok) {
  Write-Warning "Public API failed: $($n.err). Trying legacy /rest..."
  $n = Test-Url "$N8nBase/rest/workflows" $headers
  if (-not $n.ok) { Write-Error "n8n API failed (both styles): $($n.err)"; exit 1 }
}
Write-Host "n8n workflows => $($n.status)"

Write-Host 'Checklist: TTS docs...'
$t = Test-Url "$TtsBase/docs" $null
if (-not $t.ok) { Write-Warning "TTS check failed: $($t.err)" } else { Write-Host "TTS /docs => $($t.status)" }

Write-Host 'Checklist: .env sanity...'
$envPath = Join-Path $PSScriptRoot '../backend/.env.local'
if (-not (Test-Path $envPath)) { Write-Warning 'backend/.env.local missing' }
else {
  $txt = Get-Content $envPath -Raw
  if ($txt -match 'WEBHOOK_SECRET=changeme') { Write-Warning 'WEBHOOK_SECRET still changeme; update recommended' } else { Write-Host 'WEBHOOK_SECRET looks set.' }
}

Write-Host 'Running E2E (tools-based)...'
& (Join-Path $PSScriptRoot 'run-e2e.ps1') -ApiBase $ApiBase
if ($LASTEXITCODE -ne 0) { Write-Error 'E2E tools FAILED'; exit 1 }

if ($WithN8n) {
  Write-Host 'Running E2E (n8n pipeline)...'
  & (Join-Path $PSScriptRoot 'run-e2e-n8n.ps1') -ApiBase $ApiBase
  if ($LASTEXITCODE -ne 0) { Write-Error 'E2E n8n FAILED'; exit 1 }
}

Write-Host 'Checklist: PASS'
