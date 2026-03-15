# Activates the local venv for this project
$venvActivate = Join-Path $PSScriptRoot ".venv\Scripts\Activate.ps1"

if (-not (Test-Path $venvActivate)) {
  Write-Error "Virtual environment not found: $venvActivate"
  Write-Host "Create it with: py -m venv .venv"
  exit 1
}

. $venvActivate
python --version
