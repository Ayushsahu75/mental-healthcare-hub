@echo off
echo ========================================
echo Starting Backend Server
echo ========================================
echo.

cd /d "%~dp0"

echo Changing to backend directory...
if not exist backend (
    echo ❌ Backend directory not found!
    pause
    exit /b 1
)

cd backend

echo.
echo Checking Python...
python --version
if errorlevel 1 (
    echo.
    echo ❌ Python not found! Please install Python first.
    pause
    exit /b 1
)

echo.
echo Checking .env file...
if not exist .env (
    echo.
    echo ⚠️  .env file not found in backend folder!
    echo Please create .env file with your API key.
    pause
    exit /b 1
)

echo.
echo Checking dependencies...
pip show flask >nul 2>&1
if errorlevel 1 (
    echo.
    echo ⚠️  Dependencies not installed. Installing...
    pip install -r requirements.txt
)

echo.
echo ✅ Starting backend server...
echo.
echo Backend will run on: http://localhost:5000
echo Backend directory: %CD%
echo.
echo Press Ctrl+C to stop the server
echo.
echo ========================================
echo.

python app.py

pause
