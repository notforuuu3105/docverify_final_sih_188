@echo off
title DocVerify - Launch Full System (SIH 2026)
cd /d "%~dp0"

echo ========================================================
echo Launching DocVerify AI Full-Stack Platform...
echo ========================================================

start "DocVerify Backend" cmd /k "call START_BACKEND.bat"
timeout /t 3 /nobreak >nul
start "DocVerify Frontend" cmd /k "call START_FRONTEND.bat"
timeout /t 2 /nobreak >nul
start http://localhost:5173/verify

echo.
echo ========================================================
echo DocVerify is running!
echo Frontend: http://localhost:5173/verify
echo Backend:  http://127.0.0.1:8000/docs
echo ========================================================
