from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from textblob import TextBlob
import random

app = Flask(__name__)
CORS(app)

responses = {
    'en': {
        'positive_strong': [
            "That's fantastic to hear! Keep shining.",
            "Awesome! Your positivity is contagious.",
            "Wonderful! Keep embracing that great feeling."
        ],
        'positive_mild': [
            "It's nice to hear that. Keep that positive energy going!",
            "Good to know! I hope your day continues to be a good one.",
            "That sounds lovely. What else is making you smile today?"
        ],
        'neutral': [
            "I see. Tell me more about what's on your mind.",
            "Thanks for sharing. Is there anything else you'd like to talk about?",
            "I'm listening. Feel free to elaborate."
        ],
        'negative_mild': [
            "I understand. It sounds like things are a bit tough right now. Remember to be kind to yourself.",
            "I'm sorry you're going through that. It's okay to have off days.",
            "That sounds challenging. Remember that this feeling will pass."
        ],
        'negative_strong': [
            "I'm so sorry to hear that you're feeling this way. Please know that your feelings are valid.",
            "That sounds incredibly difficult. Please be gentle with yourself. Here's a tip: Try the 5-4-3-2-1 grounding technique.",
            "I'm here for you. It takes a lot of strength to go through this. Remember to breathe."
        ]
    },
    'hi': {
        'positive_strong': [
            "Yeh sunkar bahut achha laga! Aise hi chamakte raho.",
            "Shaandaar! Aapki positivity sabko inspire karti hai.",
            "Bahut badhiya! Is achhe ehsaas ko jeete raho."
        ],
        'positive_mild': [
            "Yeh sunkar achha laga. Is positive energy ko banaye rakhein!",
            "Jaan kar khushi hui! Ummid hai aapka din achha guzrega.",
            "Kafi acha hai. Aaj aur kya hai jo aapko muskurane par majboor kar raha hai?"
        ],
        'neutral': [
            "Main samajh raha hoon. Apne mann mein kya hai, aur batao.",
            "Share karne ke liye shukriya. Kya aap kuch aur baat karna chahenge?",
            "Main sun raha hoon. Aap aur bhi bata sakte hain."
        ],
        'negative_mild': [
            "Main samajhta hoon. Lagta hai abhi cheezein thodi mushkil hain. Apna khayal rakhein.",
            "Mujhe afsos hai ki aap is daur se guzar rahe hain. Himmat mat haro.",
            "Yeh sunne mein mushkil lag raha hai. Yaad rakhein ki yeh ehsaas bhi guzar jayega."
        ],
        'negative_strong': [
            "Mujhe sunkar bahut dukh hua ki aap aisa mehsoos kar rahe hain. Aapke ehsaas bilkul ahem hain.",
            "Yeh sunne mein behad mushkil lag raha hai. Kripya apne aap par naram rahein. Ek tip: 5-4-3-2-1 grounding technique try karein.",
            "Main aapke liye yahan hoon. Isse guzarne ke liye bahut himmat chahiye. Saans lete rahein."
        ]
    }
}

hinglish_negative_keywords = ['stressed', 'pareshan', 'sad', 'dukhi', 'akela', 'udas', 'tensed', 'tension', 'chinta']

@app.route('/')
def index():
    return send_from_directory('.', 'index.html')

@app.route('/<path:path>')
def static_files(path):
    return send_from_directory('.', path)

@app.route('/chat', methods=['POST'])
def chat():
    message = request.json['message'].lower()
    language = request.json.get('language', 'en')
    
    response_category = None

    if language == 'hi':
        if any(keyword in message for keyword in hinglish_negative_keywords):
            response_category = 'negative_mild'

    if not response_category:
        blob = TextBlob(message)
        sentiment = blob.sentiment.polarity
        if sentiment > 0.5:
            response_category = 'positive_strong'
        elif sentiment > 0:
            response_category = 'positive_mild'
        elif sentiment == 0:
            response_category = 'neutral'
        elif sentiment < -0.5:
            response_category = 'negative_strong'
        else:
            response_category = 'negative_mild'
    
    response = random.choice(responses[language][response_category])

    return jsonify({'response': response})

if __name__ == '__main__':
    app.run(debug=True)
