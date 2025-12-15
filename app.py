from flask import Flask, request, jsonify, send_from_directory, session, redirect, url_for
from flask_cors import CORS
import requests
from database import save_chat_message, get_chat_history, find_user_by_username, create_user
from werkzeug.security import check_password_hash

app = Flask(__name__)
CORS(app)
app.secret_key = 'Manish@123'  # Replace with a real secret key

# -------------------------
# GEMINI REST API SETTINGS
# -------------------------
MODEL = "models/gemini-2.5-flash"
API_KEY = "AIzaSyAkLfXbgOoWwRloyyN-VvM0NY4cx4JgeN0"
API_URL = f"https://generativelanguage.googleapis.com/v1/{MODEL}:generateContent?key={API_KEY}"

def generate_ai_response(user_message, language='en'):
    try:
        if language == 'hi':
            prompt = (
                "You are a caring friend. Respond in Hinglish (Hindi + English) with empathy.\n"
                "If the user mentions stress, headache, or similar issues, you can suggest potential medicines and other coping methods.\n"
                "IMPORTANT: Always include this disclaimer if you suggest any medicine or treatment: 'Please consult a doctor or a qualified medical professional before taking any medication or trying any new treatment.'\n"
                f"User: {user_message}"
            )
        else:
            prompt = (
                "You are a caring mental health assistant. Respond with kindness and emotional safety.\n"
                "If the user mentions stress, headache, or similar issues, you can suggest potential medicines and other coping methods.\n"
                "IMPORTANT: Always include this disclaimer if you suggest any medicine or treatment: 'Please consult a doctor or a qualified medical professional before taking any medication or trying any new treatment.'\n"
                f"User: {user_message}"
            )

        payload = {
            "contents": [
                {
                    "parts": [{"text": prompt}]
                }
            ]
        }

        response = requests.post(API_URL, json=payload)
        data = response.json()

        if "error" in data:
            print("GEMINI REAL API ERROR:", data["error"])
            return "Sorry, the AI service is currently unavailable. Please try again later."

        if "candidates" not in data:
            print("GEMINI RESPONSE ISSUE:", data)
            return "I'm sorry, I couldn't generate a response."

        return data["candidates"][0]["content"]["parts"][0]["text"]

    except Exception as e:
        print("GEMINI ERROR:", e)
        return "I'm sorry, I couldn't respond right now."

# -------------------------
# AUTHENTICATION ROUTES
# -------------------------

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.json.get('username')
        password = request.json.get('password')
        user = find_user_by_username(username)

        if user and check_password_hash(user['password'], password):
            session['user_id'] = str(user['_id'])
            return jsonify({"success": True})
        return jsonify({"success": False, "message": "Invalid credentials"}), 401
    return send_from_directory('.', 'login.html')

@app.route('/signup', methods=['GET', 'POST'])
def signup():
    if request.method == 'POST':
        username = request.json.get('username')
        password = request.json.get('password')
        if find_user_by_username(username):
            return jsonify({"success": False, "message": "Username already exists"}), 400
        
        create_user(username, password)
        return jsonify({"success": True})
    return send_from_directory('.', 'signup.html')

@app.route('/logout')
def logout():
    session.clear()
    return redirect(url_for('login'))

# -------------------------
# FRONTEND ROUTES
# -------------------------

@app.route('/')
def home():
    return send_from_directory('.', 'home.html')

@app.route('/chat-page')
def chat_page():
    if 'user_id' not in session:
        return redirect(url_for('login'))
    return send_from_directory('.', 'index.html')

@app.route('/<path:path>')
def static_files(path):
    return send_from_directory('.', path)

# -------------------------
# CHAT API ROUTE
# -------------------------

@app.route('/chat', methods=['POST'])
def chat():
    if 'user_id' not in session:
        return jsonify({"error": "Unauthorized"}), 401

    user_id = session['user_id']
    user_message = request.json.get("message", "")
    language = request.json.get("language", "en")

    reply = generate_ai_response(user_message, language)
    
    save_chat_message(user_id, user_message, reply)

    return jsonify({'response': reply})

# -------------------------
# CHAT HISTORY ROUTE
# -------------------------

@app.route('/history', methods=['GET'])
def history():
    if 'user_id' not in session:
        return jsonify({"error": "Unauthorized"}), 401
        
    user_id = session['user_id']
    history = get_chat_history(user_id)
    
    for item in history:
        item['_id'] = str(item['_id'])
        
    return jsonify(history)

# -------------------------
# START FLASK SERVER
# -------------------------

if __name__ == '__main__':
    app.run(debug=True)
