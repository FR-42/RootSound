@echo off
chcp 65001 >nul
cd /d "%~dp0"
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0Build-PhraseStudio.ps1" -Run
if errorlevel 1 (
  echo.
  echo 构建未完成，请把上面的错误告诉助手。
  pause
)
