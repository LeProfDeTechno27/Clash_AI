param(
  [string]$BaseUrl = 'http://localhost:5678',
  [string]$N8nApiKey
)
$ErrorActionPreference = 'Stop'
$files = Get-ChildItem -Path (Join-Path $PSScriptRoot '../n8n/workflows') -Filter *.json
$headers = @{ 'Content-Type' = 'application/json' }
if ($N8nApiKey) {
  $headers['X-N8N-API-KEY'] = $N8nApiKey
  $headers['Authorization'] = 'Bearer ' + $N8nApiKey
}
foreach($f in $files){
  Write-Host "Importing $($f.Name) ..."
  try {
    Invoke-RestMethod -Method Post -Uri "$BaseUrl/api/v1/workflows" -Headers $headers -InFile $f.FullName | Out-Host
  } catch {
    Write-Warning "Public API failed ($($_.Exception.Message)). Trying legacy /rest..."
    Invoke-RestMethod -Method Post -Uri "$BaseUrl/rest/workflows" -Headers $headers -InFile $f.FullName | Out-Host
  }
}
