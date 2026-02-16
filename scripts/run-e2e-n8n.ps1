param([string]$ApiBase = 'http://localhost:5000', [int]$MaxWaitMs = 180000, [int]$PollMs = 2000)
$ErrorActionPreference = 'Stop'
$env:API_BASE = $ApiBase
$env:MAX_WAIT_MS = [string]$MaxWaitMs
$env:POLL_MS = [string]$PollMs
node tests/e2e-n8n.js
