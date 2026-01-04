param(
    [string]$ServerHost = '127.0.0.1',
    [int]$Port = 8000,
    [string]$Pond = 'POND_01',
    [int]$Min = 5,
    [int]$Max = 10,
    [int]$HourlyAggSeconds = 0,
    [string]$Mode = 'normal'
)

# Use $PSScriptRoot to locate the script directory reliably
if ($PSScriptRoot) { Set-Location $PSScriptRoot }

if (-not (Test-Path '.venv')) {
    Write-Host "Creating virtual environment .venv..."
    python -m venv .venv
}

Write-Host "Activating virtual environment and installing requirements..."
& .\.venv\Scripts\Activate.ps1
pip install --upgrade pip
pip install -r requirements.txt

$argsList = @('--host',$ServerHost,'--port',$Port,'--pond',$Pond,'--min',$Min,'--max',$Max)
if ($HourlyAggSeconds -gt 0) { $argsList += @('--hourly-agg-seconds',$HourlyAggSeconds) }
if ($Mode) { $argsList += @('--mode',$Mode) }

Write-Host "Running simulator with args: $argsList"
python .\simulator.py $argsList
