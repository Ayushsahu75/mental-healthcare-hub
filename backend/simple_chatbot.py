#!/usr/bin/env python3
"""
Simple AI Chatbot - No External Dependencies Required
This is a basic version that works without installing additional packages.
"""

import json
import random
import time
from datetime import datetime

class SimpleChatbot:
    def __init__(self):
        self.conversation_history = []
        self.responses = {
            "greeting": [
                "Hello! I'm your AI wellness assistant. How can I help you today?",
                "Hi there! I'm here to support your mental wellness. What's on your mind?",
                "Welcome! I'm ready to help you with any concerns or questions you have."
            ],
            "anxiety": [
                "I understand you're feeling anxious. This is completely normal, especially for students. Would you like to try some breathing exercises or relaxation techniques?",
                "Anxiety can be overwhelming, but remember that these feelings are temporary. Let's work through some coping strategies together.",
                "It's okay to feel anxious. I'm here to help you find ways to manage these feelings. What specific situation is causing you stress?"
            ],
            "stress": [
                "Stress is a common experience, especially during academic life. Let's explore some stress management techniques that might help.",
                "I hear that you're feeling stressed. Remember to take breaks and practice self-care. What's been particularly challenging lately?",
                "Stress can affect both your mental and physical health. Let's work on some strategies to help you feel more balanced."
            ],
            "sad": [
                "I'm sorry to hear you're feeling sad. It's important to acknowledge these feelings and know that you're not alone.",
                "Feeling sad is a valid emotion. Sometimes talking about what's bothering us can help. Would you like to share more?",
                "It's okay to feel down sometimes. Remember that these feelings are temporary and there are people who care about you."
            ],
            "sleep": [
                "Sleep issues can really impact your mental health. Let's explore some strategies to improve your sleep quality.",
                "Poor sleep can make everything feel more difficult. I can help you with some relaxation techniques before bedtime.",
                "Sleep is crucial for your wellbeing. What's been keeping you up at night? Let's work on some solutions together."
            ],
            "study": [
                "Academic pressure is very common among students. Let's discuss some study strategies and stress management techniques.",
                "Balancing studies with self-care is important. What specific academic challenges are you facing?",
                "It's normal to feel overwhelmed with studies. Let's work on some time management and study techniques that might help."
            ],
            "help": [
                "I'm here to help! I can assist you with breathing exercises, stress management, study tips, or just listen to what's on your mind.",
                "I'm ready to support you in any way I can. What would be most helpful for you right now?",
                "I'm here to provide guidance and support. Whether it's anxiety, stress, sleep issues, or academic concerns, I'm ready to help."
            ],
            "default": [
                "I understand you're going through something. I'm here to listen and help. Could you tell me more about what you're experiencing?",
                "I'm here to support you. Feel free to share what's on your mind, and we can work through it together.",
                "Thank you for sharing with me. I'm ready to help you with whatever you're facing. What would be most helpful right now?"
            ]
        }
    
    def get_response(self, user_input):
        """Generate a response based on user input"""
        user_input_lower = user_input.lower()
        
        # Check for specific keywords
        if any(word in user_input_lower for word in ['hello', 'hi', 'hey', 'good morning', 'good afternoon']):
            category = "greeting"
        elif any(word in user_input_lower for word in ['anxious', 'anxiety', 'worried', 'nervous']):
            category = "anxiety"
        elif any(word in user_input_lower for word in ['stressed', 'stress', 'overwhelmed', 'pressure']):
            category = "stress"
        elif any(word in user_input_lower for word in ['sad', 'depressed', 'down', 'hopeless', 'blue']):
            category = "sad"
        elif any(word in user_input_lower for word in ['sleep', 'insomnia', 'tired', 'exhausted']):
            category = "sleep"
        elif any(word in user_input_lower for word in ['study', 'studying', 'exam', 'academic', 'grades']):
            category = "study"
        elif any(word in user_input_lower for word in ['help', 'support', 'assistance']):
            category = "help"
        else:
            category = "default"
        
        # Get random response from category
        response = random.choice(self.responses[category])
        
        # Add to conversation history
        self.conversation_history.append({
            "user": user_input,
            "bot": response,
            "timestamp": datetime.now().isoformat()
        })
        
        return response
    
    def get_conversation_history(self):
        """Return conversation history"""
        return self.conversation_history
    
    def clear_conversation(self):
        """Clear conversation history"""
        self.conversation_history = []
        return "Conversation cleared. How can I help you today?"

def main():
    print("🤖 Simple AI Chatbot - Mental Wellness Assistant")
    print("=" * 50)
    print("Type 'quit' to exit, 'clear' to clear conversation")
    print("=" * 50)
    
    chatbot = SimpleChatbot()
    
    while True:
        try:
            user_input = input("\n💬 You: ").strip()
            
            if user_input.lower() in ['quit', 'exit', 'bye']:
                print("👋 Thank you for chatting! Take care of yourself!")
                break
            
            if user_input.lower() == 'clear':
                print(f"🤖 Assistant: {chatbot.clear_conversation()}")
                continue
            
            if not user_input:
                continue
            
            print("🤖 Assistant: ", end="", flush=True)
            
            # Simulate typing delay
            time.sleep(1)
            
            response = chatbot.get_response(user_input)
            print(response)
            
        except KeyboardInterrupt:
            print("\n\n👋 Goodbye! Take care!")
            break
        except Exception as e:
            print(f"\n❌ Error: {e}")

if __name__ == "__main__":
    main()




