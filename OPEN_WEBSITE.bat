@echo off
cd /d "%~dp0"
start "Website Backend" cmd /k "cd /d "%~dp0backend" && python app.py"
timeout /t 4 /nobreak >nul
start "" "http://127.0.0.1:5000"
