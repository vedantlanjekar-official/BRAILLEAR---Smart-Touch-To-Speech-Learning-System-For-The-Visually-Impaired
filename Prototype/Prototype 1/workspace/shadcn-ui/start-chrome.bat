@echo off
echo Starting BRAILLEAR development server...
echo.

REM Start dev server in a new window
start "BRAILLEAR Dev Server" cmd /k "cd /d %~dp0 && pnpm run dev"

REM Wait for server to start
echo Waiting for server to start...
timeout /t 5 /nobreak >nul

REM Open Chrome
echo Opening Chrome with BRAILLEAR...
start chrome.exe http://localhost:5174

echo.
echo BRAILLEAR is now running!
echo URL: http://localhost:5174
echo.
echo The server window will stay open. Close it to stop the server.
pause


