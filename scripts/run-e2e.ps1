param([string]$ApiBase = 'http://localhost:5000')
$ErrorActionPreference = 'Stop'
$env:API_BASE = $ApiBase
node tests/e2e-smoke.js
