@echo off
title RootSound

cd /d "%~dp0"

powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\Start-Desktop.ps1"
if errorlevel 1 goto fail
exit /b 0

:fail
pause
exit /b 1
