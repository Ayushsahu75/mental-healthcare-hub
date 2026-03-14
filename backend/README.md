# Backend Server

## 📁 Backend Files

सभी backend files इस folder में हैं:

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
`.env` file में अपनी API key add करें:
```
GROQ_API_KEY=your_api_key_here
FLASK_ENV=development
PORT=5000
```

### 3. Start Server
```bash
python app.py
```

या `START_BACKEND.bat` double-click करें (Windows)

## 📡 API Endpoints

### POST /api/chat
Chatbot को message भेजें

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
Backend status check

### POST /api/clear
Conversation history clear करें

## 🔧 Troubleshooting

### AI Response नहीं आ रहा?

1. **Check API Key:**
   ```bash
   # .env file में API key check करें
   cat .env
   ```

2. **Check Backend Logs:**
   - Backend console में errors देखें
   - API key valid है या नहीं check करें

3. **Test API:**
   ```bash
   # Browser में खोलें:
   http://localhost:5000/api/health
   ```

4. **Check Dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

### Common Issues

- **API Key Error:** `.env` file में correct API key add करें
- **Port Already in Use:** Port 5000 free करें या change करें
- **Module Not Found:** Dependencies install करें

## 📝 Notes

- Backend `http://localhost:5000` पर run होता है
- Frontend files `frontend/` folder में हैं
- API key को कभी भी commit न करें!




