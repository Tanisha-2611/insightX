@echo off
echo ========================================================
echo   INSIGHTX - AI-POWERED BUSINESS INTELLIGENCE PLATFORM
echo ========================================================
echo Starting FastAPI Python Backend on port 8000...
start cmd /k "python -m uvicorn main:app --host 127.0.0.1 --port 8000 --app-dir backend"

echo Starting Vite React + TypeScript Frontend on port 5173...
start cmd /k "cd frontend && npm run dev -- --host 127.0.0.1 --port 5173"

echo.
echo InsightX BI is launching at http://127.0.0.1:5173/
echo API Documentation available at http://127.0.0.1:8000/docs
echo ========================================================
