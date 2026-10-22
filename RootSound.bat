@echo off
title RootSound

cd /d "%~dp0"

if exist node_modules goto run
call npm install
if errorlevel 1 goto fail

:run
start "RootSound server" cmd /k "npx vite --port 5173 --strictPort"
ping -n 4 127.0.0.1 >nul
start "" http://localhost:5173
exit /b 0

:fail
pause
exit /b 1
