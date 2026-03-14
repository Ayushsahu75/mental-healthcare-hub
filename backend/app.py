#!/usr/bin/env python3
"""
AI Chatbot Backend Server
A Flask-based backend for the Mental Wellness Hub AI chatbot using GroqCloud API

Requirements:
pip install flask flask-cors groq python-dotenv

Usage:
1. Get your API key from https://console.groq.com/
2. Set your API key as environment variable: export GROQ_API_KEY="your_api_key_here"
3. Run: python app.py
"""

import os
import json
from flask import Flask, request, jsonify
from flask_cors import CORS
from groq import Groq
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Initialize Groq client
groq_client = None
api_key = os.getenv("GROQ_API_KEY")

if api_key:
    try:
        groq_client = Groq(api_key=api_key)
        print("✅ Successfully connected to GroqCloud API")
    except Exception as e:
        print(f"❌ Error initializing GroqCloud client: {e}")
        groq_client = None
else:
    print("⚠️  No GROQ_API_KEY found. Please set your API key.")

# Available models
AVAILABLE_MODELS = [
    "llama-3.1-8b-instant", 
    "llama-3.1-70b",
    "gemma2-9b-it",
]

# Default model
DEFAULT_MODEL = "llama-3.1-8b-instant"

# System prompt for the AI assistant
SYSTEM_PROMPT = """You are a specialized AI medical wellness assistant for a mental health website. You ONLY discuss medical and mental health topics. Do NOT answer questions about programming, technology, or non-medical subjects.

Available medical features:
🫁 Breathing Exercises - For anxiety, stress, relaxation
🎵 Calming Sounds - For sleep, focus, meditation
📚 Resources - Medical articles, mental health guides
👨‍⚕️ Book Counsellor - Professional mental health support
📊 Mood Tracker - Track emotional wellbeing
👥 Community - Connect with others facing similar challenges

Focus on: Mental health, anxiety, depression, stress, sleep issues, emotional wellbeing, therapy, counseling, self-care, mindfulness, relaxation techniques.

If users ask non-medical questions, politely redirect them to medical topics. Be empathetic, supportive, and provide evidence-based guidance."""

# Store conversation histories (in production, use a database)
conversations = {}

@app.route('/')
def home():
    """Health check endpoint"""
    return jsonify({
        "status": "success",
        "message": "AI Chatbot Backend is running",
        "groq_connected": groq_client is not None
    })

@app.route('/api/chat', methods=['POST'])
def chat():
    """Handle chat messages"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({"error": "No data provided"}), 400
        
        message = data.get('message', '').strip()
        user_id = data.get('user_id', 'default')
        model = data.get('model', DEFAULT_MODEL)
        
        if not message:
            return jsonify({"error": "Message cannot be empty"}), 400
        
        if not groq_client:
            print("❌ Groq client not initialized!")
            print(f"   API Key present: {api_key is not None}")
            if api_key:
                print(f"   API Key length: {len(api_key)}")
                print(f"   API Key starts with: {api_key[:10]}...")
            return jsonify({
                "error": "AI service unavailable. Please check API key configuration.",
                "response": "I'm sorry, but I'm currently unable to process your request. Please try again later or contact support.",
                "groq_connected": False
            }), 503
        
        # Get or create conversation history
        if user_id not in conversations:
            conversations[user_id] = [{"role": "system", "content": SYSTEM_PROMPT}]
        
        # Check if streaming is requested
        stream = data.get('stream', False)
        
        # Add user message to conversation
        conversations[user_id].append({"role": "user", "content": message})
        
        try:
            if stream:
                # Streaming response for line-by-line output
                print(f"📤 Starting streaming response...")
                print(f"   Model: {model}")
                print(f"   Message: {message[:50]}...")
                
                def generate():
                    try:
                        print(f"🔄 Creating streaming request to Groq API...")
                        stream_response = groq_client.chat.completions.create(
                            model=model,
                            messages=conversations[user_id],
                            max_tokens=2048,
                            temperature=0.7,
                            top_p=0.9,
                            stream=True
                        )
                        
                        print(f"✅ Stream response received, processing chunks...")
                        full_response = ""
                        chunk_count = 0
                        
                        for chunk in stream_response:
                            chunk_count += 1
                            if chunk.choices and len(chunk.choices) > 0:
                                if hasattr(chunk.choices[0], 'delta') and chunk.choices[0].delta:
                                    if hasattr(chunk.choices[0].delta, 'content') and chunk.choices[0].delta.content:
                                        content = chunk.choices[0].delta.content
                                        full_response += content
                                        yield f"data: {json.dumps({'content': content, 'done': False})}\n\n"
                        
                        print(f"✅ Streaming complete: {chunk_count} chunks, {len(full_response)} characters")
                        
                        # Add complete response to conversation only if we got a response
                        if full_response:
                            conversations[user_id].append({"role": "assistant", "content": full_response})
                            yield f"data: {json.dumps({'content': '', 'done': True, 'full_response': full_response})}\n\n"
                        else:
                            print(f"⚠️  No response content received")
                            yield f"data: {json.dumps({'error': 'No response from AI', 'done': True})}\n\n"
                    except Exception as e:
                        import traceback
                        error_msg = str(e)
                        print(f"❌ Streaming error: {error_msg}")
                        print(traceback.format_exc())
                        yield f"data: {json.dumps({'error': error_msg, 'done': True})}\n\n"
                
                from flask import Response
                return Response(generate(), mimetype='text/event-stream', headers={
                    'Cache-Control': 'no-cache',
                    'Connection': 'keep-alive',
                    'X-Accel-Buffering': 'no'
                })
            else:
                # Non-streaming response
                print(f"📤 Sending request to Groq API...")
                print(f"   Model: {model}")
                print(f"   Message: {message[:50]}...")
                print(f"   Messages in conversation: {len(conversations[user_id])}")
                
                response = groq_client.chat.completions.create(
                    model=model,
                    messages=conversations[user_id],
                    max_tokens=2048,
                    temperature=0.7,
                    top_p=0.9,
                    stream=False
                )
                
                # Extract the response
                if response.choices and len(response.choices) > 0:
                    if hasattr(response.choices[0], 'message') and response.choices[0].message:
                        bot_response = response.choices[0].message.content
                        print(f"✅ Received response: {len(bot_response)} characters")
                    else:
                        raise Exception("No message in response")
                else:
                    raise Exception("No choices in response")
                
                # Add bot response to conversation
                conversations[user_id].append({"role": "assistant", "content": bot_response})
                
                return jsonify({
                    "status": "success",
                    "response": bot_response,
                    "model": model,
                    "conversation_length": len(conversations[user_id])
                })
            
        except Exception as e:
            import traceback
            error_msg = str(e)
            print(f"AI service error: {error_msg}")
            print(traceback.format_exc())
            
            # Remove the user message if request failed
            if conversations[user_id] and conversations[user_id][-1]["role"] == "user":
                conversations[user_id].pop()
            
            # Return detailed error for debugging
            return jsonify({
                "error": f"AI service error: {error_msg}",
                "response": "I'm sorry, I encountered an error while processing your request. Please try again.",
                "details": error_msg if "development" in os.getenv("FLASK_ENV", "") else None
            }), 500
            
    except Exception as e:
        return jsonify({"error": f"Server error: {str(e)}"}), 500

@app.route('/api/clear', methods=['POST'])
def clear_conversation():
    """Clear conversation history for a user"""
    try:
        data = request.get_json()
        user_id = data.get('user_id', 'default')
        
        # Reset conversation with system prompt
        conversations[user_id] = [{"role": "system", "content": SYSTEM_PROMPT}]
        
        return jsonify({
            "status": "success",
            "message": "Conversation cleared"
        })
        
    except Exception as e:
        return jsonify({"error": f"Server error: {str(e)}"}), 500

@app.route('/api/models', methods=['GET'])
def get_models():
    """Get available models"""
    return jsonify({
        "status": "success",
        "models": AVAILABLE_MODELS,
        "default_model": DEFAULT_MODEL
    })

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check with detailed status"""
    return jsonify({
        "status": "success",
        "groq_connected": groq_client is not None,
        "api_key_configured": api_key is not None,
        "available_models": len(AVAILABLE_MODELS),
        "active_conversations": len(conversations)
    })

@app.route('/api/conversation/<user_id>', methods=['GET'])
def get_conversation(user_id):
    """Get conversation history for a user"""
    try:
        conversation = conversations.get(user_id, [])
        return jsonify({
            "status": "success",
            "conversation": conversation,
            "length": len(conversation)
        })
    except Exception as e:
        return jsonify({"error": f"Server error: {str(e)}"}), 500

@app.errorhandler(404)
def not_found(error):
    return jsonify({"error": "Endpoint not found"}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({"error": "Internal server error"}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    debug = os.environ.get('FLASK_ENV') == 'development'
    
    print(f"\n{'='*60}")
    print(f"🚀 Starting AI Chatbot Backend Server...")
    print(f"{'='*60}")
    print(f"📡 Server will run on: http://localhost:{port}")
    print(f"🔧 Debug mode: {debug}")
    print(f"📁 Working directory: {os.getcwd()}")
    print(f"🔑 API Key loaded: {api_key is not None}")
    if api_key:
        print(f"🔑 API Key length: {len(api_key)} characters")
    print(f"🤖 Groq API connected: {groq_client is not None}")
    print(f"📋 Available models: {', '.join(AVAILABLE_MODELS)}")
    print(f"\n💡 API Endpoints:")
    print(f"   POST /api/chat - Send message to AI (streaming supported)")
    print(f"   POST /api/clear - Clear conversation")
    print(f"   GET  /api/models - Get available models")
    print(f"   GET  /api/health - Health check")
    print(f"   GET  /api/conversation/<user_id> - Get conversation history")
    print(f"\n🌐 Frontend: http://localhost:3000 (React) or open legacy HTML files")
    print(f"🌐 Backend: http://localhost:{port}")
    print(f"\n{'='*60}")
    print(f"✅ Ready to receive requests!")
    print(f"{'='*60}\n")
    
    if not groq_client:
        print("⚠️  WARNING: Groq client not initialized!")
        print("⚠️  Please check your API key in .env file")
        print("⚠️  Backend will start but AI features will not work\n")
    
    app.run(host='0.0.0.0', port=port, debug=debug)




