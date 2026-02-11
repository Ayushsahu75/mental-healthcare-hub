@echo off
echo Installing AI Chatbot Dependencies...
echo.

python -m pip install --upgrade pip
python -m pip install flask==3.0.0
python -m pip install flask-cors==4.0.0
python -m pip install groq==0.4.1
python -m pip install python-dotenv==1.0.0

echo.
echo Testing installation...
python -c "import flask; print('Flask: OK')"
python -c "import flask_cors; print('Flask-CORS: OK')"
python -c "import groq; print('Groq: OK')"
python -c "import dotenv; print('Python-dotenv: OK')"

echo.
echo Installation complete!
pause




