@echo off
chcp 65001 >nul
setlocal EnableDelayedExpansion

:: DikachiVideo AI Studio — Startup Script FOR (Windows)
:: Runs both backend and frontend servers

title DikachiVideo AI Studio

:: Colors
set "GREEN=[92m"
set "YELLOW=[93m"
set "RED=[91m"
set "BLUE=[94m"
set "NC=[0m"

:: Project paths
set "PROJECT_ROOT=%~dp0"
set "BACKEND_DIR=%PROJECT_ROOT%backend"
set "FRONTEND_DIR=%PROJECT_ROOT%frontend"
set "BACKEND_PORT=8000"
set "FRONTEND_PORT=3000"

:: Print banner
echo %BLUE%
echo ╔═══════════════════════════════════════════════════════════════╗
echo ║                                                               ║
echo ║           DikachiVideo AI Studio — Startup Script             ║
echo ║                                                               ║
echo ╚═══════════════════════════════════════════════════════════════╝
echo %NC%

:: Check prerequisites
echo %BLUE%Checking prerequisites...%NC%

:: Check Python
python --version >nul 2>&1
if errorlevel 1 (
    echo %RED%ERROR: Python is not installed or not in PATH.%NC%
    echo %YELLOW%Please install Python 3.10+ from https://python.org%NC%
    pause
    exit /b 1
)
for /f "tokens=*" %%a in ('python --version') do set PYTHON_VERSION=%%a
echo %GREEN%✓ Python found: %PYTHON_VERSION%%NC%

:: Check Node.js
node --version >nul 2>&1
if errorlevel 1 (
    echo %RED%ERROR: Node.js is not installed or not in PATH.%NC%
    echo %YELLOW%Please install Node.js 18+ from https://nodejs.org%NC%
    pause
    exit /b 1
)
for /f "tokens=*" %%a in ('node --version') do set NODE_VERSION=%%a
echo %GREEN%✓ Node.js found: %NODE_VERSION%%NC%

:: Check FFmpeg
ffmpeg -version >nul 2>&1
if errorlevel 1 (
    echo %RED%ERROR: FFmpeg is not installed or not in PATH.%NC%
    echo %YELLOW%Please install FFmpeg 5.0+ — see INSTALLATION.md%NC%
    pause
    exit /b 1
)
echo %GREEN%✓ FFmpeg found%NC%

:: Check directories
if not exist "%BACKEND_DIR%" (
    echo %RED%ERROR: Backend directory not found at %BACKEND_DIR%%NC%
    pause
    exit /b 1
)
if not exist "%FRONTEND_DIR%" (
    echo %RED%ERROR: Frontend directory not found at %FRONTEND_DIR%%NC%
    pause
    exit /b 1
)

:: Check virtual environment
if not exist "%BACKEND_DIR%\venv" (
    echo %YELLOW%Virtual environment not found. Creating one...%NC%
    cd /d "%BACKEND_DIR%"
    python -m venv venv
)

:: Check backend dependencies
if not exist "%BACKEND_DIR%\venv\Scripts\uvicorn.exe" (
    echo %YELLOW%Installing backend dependencies...%NC%
    cd /d "%BACKEND_DIR%"
    call venv\Scripts\activate.bat
    pip install -r requirements.txt
)

:: Check frontend dependencies
if not exist "%FRONTEND_DIR%\node_modules" (
    echo %YELLOW%Installing frontend dependencies...%NC%
    cd /d "%FRONTEND_DIR%"
    call npm install
)

:: Check .env file
if not exist "%BACKEND_DIR%\.env" (
    if exist "%BACKEND_DIR%\.env.example" (
        echo %YELLOW%Creating .env from example...%NC%
        copy "%BACKEND_DIR%\.env.example" "%BACKEND_DIR%\.env" >nul
    )
)

:: Initialize database if needed
if not exist "%BACKEND_DIR%\data\dikachivideo.db" (
    echo %YELLOW%Initializing database...%NC%
    cd /d "%BACKEND_DIR%"
    call venv\Scripts\activate.bat
    if not exist "data" mkdir data
    python -c "from app.database import init_db; init_db()" 2>nul
)

:: Kill existing processes on ports
echo %BLUE%Checking for existing processes...%NC%
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :%BACKEND_PORT%') do (
    echo %YELLOW%Killing process on port %BACKEND_PORT% (PID: %%a)%NC%
    taskkill /PID %%a /F >nul 2>&1
)
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :%FRONTEND_PORT%') do (
    echo %YELLOW%Killing process on port %FRONTEND_PORT% (PID: %%a)%NC%
    taskkill /PID %%a /F >nul 2>&1
)

:: Start backend
echo %BLUE%Starting backend server on port %BACKEND_PORT%...%NC%
start "DikachiVideo Backend" cmd /k "cd /d "%BACKEND_DIR%" && call venv\Scripts\activate.bat && python run.py"

:: Wait for backend
echo %YELLOW%Waiting for backend to start...%NC%
timeout /t 3 /nobreak >nul

:: Start frontend
echo %BLUE%Starting frontend server on port %FRONTEND_PORT%...%NC%
start "DikachiVideo Frontend" cmd /k "cd /d "%FRONTEND_DIR%" && npm run dev"

:: Wait for frontend
echo %YELLOW%Waiting for frontend to start...%NC%
timeout /t 5 /nobreak >nul

:: Success message
echo %GREEN%
echo ╔═══════════════════════════════════════════════════════════════╗
echo ║                                                               ║
echo ║              DikachiVideo AI Studio is Running!               ║
echo ║                                                               ║
echo ║   Frontend: http://localhost:3000                             ║
echo ║   Backend:  http://localhost:8000                             ║
echo ║   API Docs: http://localhost:8000/docs                        ║
echo ║                                                               ║
echo ║   Close this window to stop both servers                      ║
echo ║                                                               ║
echo ╚═══════════════════════════════════════════════════════════════╝
echo %NC%

:: Keep window open
echo.
echo Press any key to stop all servers...
pause >nul

:: Shutdown
echo %YELLOW%Shutting down servers...%NC%
taskkill /FI "WINDOWTITLE eq DikachiVideo Backend*" /F >nul 2>&1
taskkill /FI "WINDOWTITLE eq DikachiVideo Frontend*" /F >nul 2>&1
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :%BACKEND_PORT%') do taskkill /PID %%a /F >nul 2>&1
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :%FRONTEND_PORT%') do taskkill /PID %%a /F >nul 2>&1
echo %GREEN%Servers stopped.%NC%
timeout /t 2 >nul