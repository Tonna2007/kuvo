$ErrorActionPreference = "Stop"
$goBin = "C:\Program Files\Go\bin"
if (Test-Path "$goBin\go.exe") {
  $env:Path = "$goBin;$env:Path"
}
if (-not (Get-Command go -ErrorAction SilentlyContinue)) {
  Write-Error "Go is installed but not on PATH. Close this terminal, open a new one, and run .\run.ps1 again."
}
Set-Location $PSScriptRoot
$env:APP_STORE = "memory"
$env:APP_ENV = "dev"
Write-Host "Starting Kuvo API on http://localhost:8080 (in-memory, no Docker/cloud)"
Write-Host "If 8080 is busy, run: `$env:HTTP_ADDR=':8090'; go run ./cmd/api"
go run ./cmd/api
