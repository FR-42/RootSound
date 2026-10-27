@echo off
chcp 65001 >nul
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0Build-ReferenceStudio.ps1" -Run
if errorlevel 1 pause
