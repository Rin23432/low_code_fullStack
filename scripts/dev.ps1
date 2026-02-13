param(
  [switch]$BackendOnly
)

$root = Split-Path -Parent $PSScriptRoot

function Start-ServiceWindow {
  param(
    [string]$Name,
    [string]$Workdir,
    [string]$Command
  )

  Write-Host ("Starting {0}: {1}" -f $Name, $Command) -ForegroundColor Cyan
  Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-Command",
    "Set-Location '$Workdir'; $Command"
  ) | Out-Null
}

# Backend microservices
Start-ServiceWindow -Name "question-service" -Workdir "$root\apps\backend" -Command "npm run start:question"
Start-ServiceWindow -Name "answer-service" -Workdir "$root\apps\backend" -Command "npm run start:answer"
Start-ServiceWindow -Name "gateway" -Workdir "$root\apps\backend" -Command "npm run start:gateway"

if (-not $BackendOnly) {
  Start-ServiceWindow -Name "mock" -Workdir "$root\apps\mock" -Command "npm run dev"
  Start-ServiceWindow -Name "low_code" -Workdir "$root\apps\low_code" -Command "npm start"
  Start-ServiceWindow -Name "low_code_c" -Workdir "$root\apps\low_code_c" -Command "npm run dev"
}

Write-Host "Waiting for backend health checks..." -ForegroundColor Yellow
Start-Sleep -Seconds 4

$checks = @(
  "http://localhost:3100/health",
  "http://localhost:3101/health",
  "http://localhost:3102/health"
)

foreach ($url in $checks) {
  try {
    $result = Invoke-RestMethod -Method Get -Uri $url -TimeoutSec 5
    Write-Host ("OK {0} -> {1}" -f $url, ($result | ConvertTo-Json -Compress)) -ForegroundColor Green
  } catch {
    Write-Host ("FAIL {0} -> {1}" -f $url, $_.Exception.Message) -ForegroundColor Red
  }
}
