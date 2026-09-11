@echo off
title DocVerify - React Frontend (Port 5173)
cd /d "%~dp0"
set PATH=C:\Program Files\nodejs;C:\Users\Hp\nodejs;%PATH%
echo ========================================================
echo Starting DocVerify Frontend Development Server...
echo Terminal: http://localhost:5173/verify
echo ========================================================

:: Free port 5173 if occupied
for /f "tokens=5" %%p in ('netstat -aon ^| findstr ":5173" ^| findstr "LISTENING"') do (
    taskkill /f /pid %%p >nul 2>&1
)

node node_modules\vite\bin\vite.js --port 5173
pause
