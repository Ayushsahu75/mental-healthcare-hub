@echo off
echo ========================================
echo Starting Backend Server
echo ========================================
echo.

cd /d "%~dp0"

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
    echo ⚠️  .env file not found!
    echo Creating .env file...
    (
        echo GROQ_API_KEY=your_api_key_here
        echo FLASK_ENV=development
        echo PORT=5000
    ) > .env
    echo.
    echo ❌ Please add your GROQ_API_KEY in .env file and restart!
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
echo.
echo Press Ctrl+C to stop the server
echo.
echo ========================================
echo.

python app.py

pause




