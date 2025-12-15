from pymongo import MongoClient
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash

# --- Database Configuration ---
MONGO_URI = "mongodb://localhost:27017/"
DB_NAME = "mental_health_companion"
CHAT_HISTORY_COLLECTION = "chat_history"
USERS_COLLECTION = "users"

# --- Database Connection ---
try:
    client = MongoClient(MONGO_URI)
    db = client[DB_NAME]
    chat_history_collection = db[CHAT_HISTORY_COLLECTION]
    users_collection = db[USERS_COLLECTION]
    print("Successfully connected to MongoDB!")

except Exception as e:
    print(f"Error connecting to MongoDB: {e}")
    client = None
    db = None
    chat_history_collection = None
    users_collection = None

# --- User Functions ---
def create_user(username, password):
    """
    Creates a new user with a hashed password.
    """
    if users_collection is None:
        return None
    
    hashed_password = generate_password_hash(password)
    return users_collection.insert_one({
        "username": username,
        "password": hashed_password
    })

def find_user_by_username(username):
    """
    Finds a user by their username.
    """
    if users_collection is None:
        return None
    
    return users_collection.find_one({"username": username})

# --- Chat History Functions ---
def save_chat_message(user_id, user_message, bot_response):
    """
    Saves a user's message and the bot's response to the database.
    """
    if chat_history_collection is None:
        print("Cannot save message: MongoDB not connected.")
        return

    chat_history_collection.insert_one({
        "user_id": user_id,
        "user_message": user_message,
        "bot_response": bot_response,
        "timestamp": datetime.utcnow()
    })

def get_chat_history(user_id):
    """
    Retrieves the chat history for a given user ID.
    """
    if chat_history_collection is None:
        print("Cannot retrieve history: MongoDB not connected.")
        return []

    history = chat_history_collection.find({"user_id": user_id}).sort("timestamp", 1)
    return list(history)
