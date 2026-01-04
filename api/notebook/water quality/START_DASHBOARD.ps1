# Shrimp Farm Water Quality Dashboard - Startup Script
# This script starts both the backend API and frontend dashboard

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Shrimp Farm Water Quality Dashboard  " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$ErrorActionPreference = "Continue"

# Get the directory where this script is located
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $ScriptDir

Write-Host "[1/4] Checking Python dependencies..." -ForegroundColor Yellow
$requirements = @(
    "fastapi",
    "uvicorn",
    "joblib",
    "numpy",
    "scikit-learn",
    "pydantic",
    "websockets"
)

foreach ($pkg in $requirements) {
    $installed = python -c "import $pkg" 2>$null
    if ($LASTEXITCODE -ne 0) {
        Write-Host "  Installing $pkg..." -ForegroundColor Gray
        pip install $pkg -q
    } else {
        Write-Host "  ✓ $pkg installed" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "[2/4] Checking frontend dependencies..." -ForegroundColor Yellow
Set-Location "dashboard\web"
if (-not (Test-Path "node_modules")) {
    Write-Host "  Installing npm packages..." -ForegroundColor Gray
    npm install
} else {
    Write-Host "  ✓ npm packages installed" -ForegroundColor Green
}
Set-Location $ScriptDir

Write-Host ""
Write-Host "[3/4] Starting Backend API Server..." -ForegroundColor Yellow
Write-Host "  URL: http://127.0.0.1:8000" -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$ScriptDir'; uvicorn predict_api:app --host 127.0.0.1 --port 8000 --reload"

Write-Host ""
Write-Host "[4/4] Starting Frontend Dashboard..." -ForegroundColor Yellow
Write-Host "  URL: http://localhost:5173" -ForegroundColor Cyan
Start-Sleep -Seconds 3
Set-Location "dashboard\web"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$ScriptDir\dashboard\web'; npm run dev"

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  Dashboard Started Successfully!      " -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Backend API:  http://127.0.0.1:8000" -ForegroundColor Cyan
Write-Host "Frontend UI:  http://localhost:5173" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press Ctrl+C in each terminal window to stop the servers." -ForegroundColor Yellow
Write-Host ""

# Wait for user input before closing this window
Read-Host "Press Enter to close this window"
