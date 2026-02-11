@echo off
echo ========================================
echo Backend Setup Script
echo ========================================
echo.

echo Creating .env file...
(
echo # GroqCloud API Configuration
echo # Get your API key from https://console.groq.com/
echo GROQ_API_KEY=
echo.
echo # Flask Configuration
echo FLASK_ENV=development
echo PORT=5000
) > .env

echo.
echo ✅ .env file created!
echo.
echo ⚠️  IMPORTANT: Edit .env file and add your GROQ_API_KEY
echo.
echo Steps:
echo 1. Open .env file in notepad
echo 2. Replace "your_groq_api_key_here" with your actual API key
echo 3. Save the file
echo 4. Run: python app.py
echo.
echo Getting API key:
echo - Visit: https://console.groq.com/
echo - Sign up / Login
echo - Generate API key
echo - Copy and paste in .env file
echo.
pause




