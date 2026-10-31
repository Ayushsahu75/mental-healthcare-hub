#!/usr/bin/env python3

import os
from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
from dotenv import load_dotenv
from groq import Groq

load_dotenv(os.path.join(os.path.dirname(__file__), '.env'))

app = Flask(__name__)
CORS(app)

DATA_DIRECTORY = os.path.join(os.path.dirname(__file__), 'data')
FRONTEND_DIRECTORY = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'frontend'))
DEFAULT_MODEL = os.getenv('GROQ_MODEL', 'llama-3.1-8b-instant')
api_key = os.getenv('GROQ_API_KEY')
groq_client = Groq(api_key=api_key) if api_key else None
conversations = {}

@app.route('/')
def frontend_home():
    return send_from_directory(FRONTEND_DIRECTORY, 'index.html')

@app.route('/frontend/<path:filename>')
def frontend_files(filename):
    return send_from_directory(FRONTEND_DIRECTORY, filename)

@app.route('/<path:filename>')
def site_files(filename):
    return send_from_directory(FRONTEND_DIRECTORY, filename)

@app.route('/data/<path:filename>')
def serve_data(filename):
    return send_from_directory(DATA_DIRECTORY, filename)

@app.route('/api/health')
def health():
    return jsonify({'status': 'success', 'groq_connected': groq_client is not None})

@app.route('/api/chat', methods=['POST'])
def chat():
    payload = request.get_json(silent=True) or {}
    message = str(payload.get('message', '')).strip()
    user_id = str(payload.get('user_id', 'default'))
    if not message:
        return jsonify({'error': 'No message provided'}), 400
    if groq_client is None:
        return jsonify({'error': 'Groq API is not configured'}), 503

    history = conversations.setdefault(user_id, [])
    history.append({'role': 'user', 'content': message})
    try:
        response = groq_client.chat.completions.create(
            model=payload.get('model', DEFAULT_MODEL),
            messages=[{'role': 'system', 'content': 'You are a supportive mental wellness assistant.'}, *history[-20:]],
            max_tokens=int(payload.get('max_tokens', 600)),
        )
        reply = response.choices[0].message.content
        history.append({'role': 'assistant', 'content': reply})
        return jsonify({'success': True, 'response': reply, 'message': reply})
    except Exception as error:
        history.pop()
        return jsonify({'error': str(error)}), 502

@app.route('/api/clear', methods=['POST'])
def clear():
    payload = request.get_json(silent=True) or {}
    conversations.pop(str(payload.get('user_id', 'default')), None)
    return jsonify({'status': 'success'})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=int(os.getenv('PORT', '5000')), debug=False)
