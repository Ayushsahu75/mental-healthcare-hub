#!/usr/bin/env python3
"""
Quick Start Script for AI Chatbot
This script helps you set up and start the AI chatbot quickly.
"""

import os
import sys
import subprocess
import time

def print_banner():
    print("=" * 60)
    print("🤖 AI Chatbot Quick Start")
    print("=" * 60)
    print()

def check_python():
    """Check if Python is installed"""
    print("🔍 Checking Python installation...")
    try:
        version = sys.version_info
        if version.major >= 3 and version.minor >= 7:
            print(f"✅ Python {version.major}.{version.minor}.{version.micro} is installed")
            return True
        else:
            print(f"❌ Python {version.major}.{version.minor}.{version.micro} is too old. Please install Python 3.7 or higher.")
            return False
    except Exception as e:
        print(f"❌ Python not found: {e}")
        return False

def check_dependencies():
    """Check if required packages are installed"""
    print("\n🔍 Checking dependencies...")
    required_packages = ['flask', 'flask_cors', 'groq', 'python_dotenv']
    missing_packages = []
    
    for package in required_packages:
        try:
            __import__(package)
            print(f"✅ {package} is installed")
        except ImportError:
            print(f"❌ {package} is missing")
            missing_packages.append(package)
    
    if missing_packages:
        print(f"\n📦 Installing missing packages: {', '.join(missing_packages)}")
        try:
            subprocess.check_call([sys.executable, '-m', 'pip', 'install', '-r', 'requirements.txt'])
            print("✅ Dependencies installed successfully")
            return True
        except subprocess.CalledProcessError as e:
            print(f"❌ Failed to install dependencies: {e}")
            return False
    else:
        print("✅ All dependencies are installed")
        return True

def check_api_key():
    """Check if API key is configured"""
    print("\n🔍 Checking API key configuration...")
    
    # Check environment variable
    api_key = os.getenv('GROQ_API_KEY')
    if api_key and api_key != 'your_groq_api_key_here':
        print("✅ GROQ_API_KEY is configured")
        return True
    
    # Check .env file
    if os.path.exists('.env'):
        try:
            with open('.env', 'r') as f:
                content = f.read()
                if 'GROQ_API_KEY=' in content and 'your_groq_api_key_here' not in content:
                    print("✅ API key found in .env file")
                    return True
        except Exception as e:
            print(f"⚠️  Error reading .env file: {e}")
    
    print("❌ GROQ_API_KEY not configured")
    print("\n📝 To configure your API key:")
    print("1. Get your free API key from https://console.groq.com/")
    print("2. Create a .env file with: GROQ_API_KEY=your_actual_api_key")
    print("3. Or set environment variable: export GROQ_API_KEY=your_actual_api_key")
    return False

def start_server():
    """Start the Flask server"""
    print("\n🚀 Starting AI Chatbot server...")
    print("📡 Server will be available at: http://localhost:5000")
    print("🌐 Open your website (index.html) to start chatting!")
    print("\n💡 Press Ctrl+C to stop the server")
    print("=" * 60)
    
    try:
        # Import and run the Flask app
        from app import app
        app.run(host='0.0.0.0', port=5000, debug=True)
    except KeyboardInterrupt:
        print("\n\n👋 Server stopped. Goodbye!")
    except Exception as e:
        print(f"\n❌ Error starting server: {e}")
        print("\n🔧 Troubleshooting:")
        print("1. Make sure no other service is using port 5000")
        print("2. Check if all dependencies are installed")
        print("3. Verify your API key is correct")

def main():
    print_banner()
    
    # Check Python
    if not check_python():
        sys.exit(1)
    
    # Check dependencies
    if not check_dependencies():
        print("\n❌ Please install dependencies manually: pip install -r requirements.txt")
        sys.exit(1)
    
    # Check API key
    if not check_api_key():
        print("\n⚠️  You can still run the server, but AI features will use fallback responses.")
        response = input("\n🤔 Do you want to continue anyway? (y/n): ").lower().strip()
        if response != 'y' and response != 'yes':
            print("👋 Setup cancelled. Please configure your API key first.")
            sys.exit(0)
    
    # Start server
    start_server()

if __name__ == "__main__":
    main()




