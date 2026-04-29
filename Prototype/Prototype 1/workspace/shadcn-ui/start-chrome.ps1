# BRAILLEAR - Launch in Chrome Script
# This script starts the dev server and opens Chrome

Write-Host "Starting BRAILLEAR development server..." -ForegroundColor Green

# Start dev server in background
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot'; pnpm run dev" -WindowStyle Minimized

# Wait for server to start
Write-Host "Waiting for server to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Open Chrome with the app URL
Write-Host "Opening Chrome..." -ForegroundColor Green
Start-Process "chrome.exe" "http://localhost:5174"

Write-Host "`nBRAILLEAR is now running!" -ForegroundColor Green
Write-Host "URL: http://localhost:5174" -ForegroundColor Cyan
Write-Host "`nPress Ctrl+C in the server window to stop the server." -ForegroundColor Yellow


