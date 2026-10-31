#!/usr/bin/env python3
"""
Test script for backend API
"""
import requests
import json

BASE_URL = "http://localhost:5000"

def test_health():
    """Test health endpoint"""
    print("Testing /api/health...")
    try:
        response = requests.get(f"{BASE_URL}/api/health")
        print(f"Status: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        return response.status_code == 200
    except Exception as e:
        print(f"Error: {e}")
        return False

def test_chat_non_streaming():
    """Test chat endpoint (non-streaming)"""
    print("\nTesting /api/chat (non-streaming)...")
    try:
        data = {
            "message": "Hello, I feel anxious",
            "user_id": "test_user",
            "model": "llama-3.1-8b-instant",
            "stream": False
        }
        response = requests.post(f"{BASE_URL}/api/chat", json=data)
        print(f"Status: {response.status_code}")
        result = response.json()
        print(f"Response: {json.dumps(result, indent=2)}")
        if 'response' in result:
            print(f"\n✅ AI Response: {result['response'][:100]}...")
        return response.status_code == 200
    except Exception as e:
        print(f"Error: {e}")
        return False

if __name__ == "__main__":
    print("=" * 50)
    print("Backend API Test")
    print("=" * 50)
    
    # Test health
    health_ok = test_health()
    
    if health_ok:
        # Test chat
        test_chat_non_streaming()
    else:
        print("\n❌ Health check failed. Is backend running?")
        print("Run: python app.py")


