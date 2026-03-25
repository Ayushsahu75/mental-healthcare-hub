# Backend Server

## 📁 Backend Files

All backend files are located in this folder:

- `app.py` - Main Flask backend server
- `requirements.txt` - Python dependencies
- `.env` - Environment variables (API key)
- `env_example.txt` - Example environment file
- `simple_chatbot.py` - Simple chatbot script
- `start_ai_chatbot.py` - AI chatbot starter script

## 🚀 Quick Start

### 1. Install Dependencies
```bash
pip install -r requirements.txt
```

### 2. Setup .env File
Add your API key in the `.env` file:
```
GROQ_API_KEY=your_api_key_here
FLASK_ENV=development
PORT=5000
```

### 3. Start Server
```bash
python app.py
```

Or double-click `START_BACKEND.bat` (Windows)

## 📡 API Endpoints

### POST /api/chat
Send a message to the chatbot

**Request:**
```json
{
  "message": "I feel anxious",
  "user_id": "user_123",
  "model": "llama-3.1-8b-instant",
  "stream": true
}
```

### GET /api/health
Check backend status

### POST /api/clear
Clear conversation history

## 🔧 Troubleshooting

### Not getting AI responses?

1. **Check API Key:**
```bash
   # Check API key in .env file
   cat .env
```

2. **Check Backend Logs:**
   - Look for errors in the backend console
   - Verify whether the API key is valid

3. **Test API:**
```bash
   # Open in browser:
   http://localhost:5000/api/health
```

4. **Check Dependencies:**
```bash
   pip install -r requirements.txt
```

### Common Issues

- **API Key Error:** Add the correct API key in the `.env` file
- **Port Already in Use:** Free up port 5000 or change it
- **Module Not Found:** Install the required dependencies

## 📝 Notes

- Backend runs at `http://localhost:5000`
- Frontend files are in the `frontend/` folder
- Never commit your API key!
