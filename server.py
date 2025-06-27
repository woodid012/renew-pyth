# server.py
import os
import json
from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from dotenv import load_dotenv

# Load environment variables
load_dotenv('.env.local')

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# MongoDB connection
def get_db_connection():
    MONGODB_URI = os.environ.get('MONGODB_URI')
    if not MONGODB_URI:
        raise Exception('MONGODB_URI environment variable not set')
    
    client = MongoClient(MONGODB_URI)
    return client.get_database()

@app.route('/api/hello', methods=['GET'])
def hello():
    return jsonify({'message': 'Hello from Python!'})

@app.route('/api/users', methods=['GET', 'POST'])
def users():
    try:
        db = get_db_connection()
        users_collection = db.users

        if request.method == 'GET':
            users = list(users_collection.find({}, {'_id': 0}))
            return jsonify({'users': users})
        
        elif request.method == 'POST':
            body = request.get_json()
            if not body:
                return jsonify({'error': 'No JSON body provided'}), 400
            
            result = users_collection.insert_one(body)
            return jsonify({
                'message': 'User created', 
                'id': str(result.inserted_id)
            }), 201
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=3001)