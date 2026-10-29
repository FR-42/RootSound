@echo off
setlocal
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0Build-SpectralForge.ps1" -Run
if errorlevel 1 pause
