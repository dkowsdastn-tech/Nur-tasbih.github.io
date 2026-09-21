@echo off
setlocal
title Nur PWA server
cd /d "%~dp0backend"

where node >nul 2>nul
if errorlevel 1 (
  echo Node.js 18.17 or newer is required. Install it, then run this file again.
  pause
  exit /b 1
)

echo.
echo Starting Nur at http://localhost:8080
echo Keep this window open while using the app.
echo Press Ctrl+C to stop the server.
echo.
node server.js
pause
