@echo off
chcp 65001 >nul
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0Build-ToneStructure.ps1" -Run
if errorlevel 1 pause
