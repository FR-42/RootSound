@echo off
title RootSound Workstation Git Commit
cd /d "%~dp0"

rem Clean timestamp, independent of locale settings
for /f %%i in ('powershell -NoProfile -Command "Get-Date -Format yyyy-MM-dd_HH.mm"') do set DTS=%%i

git add .
if errorlevel 1 goto fail
git commit -m "snapshot %DTS%"
if errorlevel 1 goto fail

echo.
echo [RootSound] Snapshot committed: %DTS%
goto end

:fail
echo.
echo [RootSound] Commit did not complete -- see git output above.
echo             Most common cause: nothing changed, nothing to commit.

:end
pause
