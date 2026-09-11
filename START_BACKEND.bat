@echo off
title DocVerify AI - FastAPI Backend (Port 8000)
cd /d "%~dp0src\backend"
echo ========================================================
echo Starting DocVerify AI Python Verification Engine...
echo Protocol: SIH 2026 AI Document Verification Platform
echo ========================================================

:: Free port 8000 if occupied
for /f "tokens=5" %%p in ('netstat -aon ^| findstr ":8000" ^| findstr "LISTENING"') do (
    taskkill /f /pid %%p >nul 2>&1
)

python -m uvicorn main:app --host 0.0.0.0 --port 8000
pause
