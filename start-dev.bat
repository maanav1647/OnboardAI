@echo off
REM OnboardAI Development Startup Script for Windows

echo.
echo 🚀 Starting OnboardAI (full-stack POC)
echo.

REM Check if Node is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Node.js is not installed or not in PATH
    exit /b 1
)

REM Start backend
echo 📝 Starting backend on port 5000...
cd backend
start "OnboardAI Backend" cmd /k npm run dev

REM Wait a bit for backend to start
timeout /t 3 /nobreak

REM Start frontend
cd ..
cd frontend
echo 🎨 Starting frontend on port 3000...
start "OnboardAI Frontend" cmd /k npm run dev

REM Wait a bit
timeout /t 2 /nobreak

echo.
echo ✅ Both servers should be running!
echo.
echo Open in your browser:
echo   Frontend: http://localhost:3000
echo   Backend:  http://localhost:5000
echo.
echo Close the command windows above to stop the servers.
echo.
