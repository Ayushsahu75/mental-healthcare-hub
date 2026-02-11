@echo off
echo ========================================
echo Opening Original Website
echo ========================================
echo.

cd /d "%~dp0"

echo [1/2] Starting Backend Server...
echo.
start "Backend Server" cmd /k "cd /d %~dp0backend && set GROQ_API_KEY=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 && set FLASK_ENV=development && set PORT=5000 && python app.py"

echo Waiting for backend to start...
timeout /t 5 /nobreak >nul

echo.
echo [2/2] Opening Original Website...
echo.
cd "frontend\legacy"
start "" "index.html"

echo.
echo ========================================
echo Website Opened!
echo ========================================
echo.
echo Backend: http://localhost:5000
echo Frontend: Original HTML files (legacy folder)
echo.
echo The website will open in your default browser.
echo.
echo To use chatbot:
echo 1. Click on "AI Support" or "AI Chat" in the website
echo 2. The chatbot is already connected to backend API
echo 3. Start chatting!
echo.
pause



