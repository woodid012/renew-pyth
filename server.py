# server.py
import os
import json
from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from bson import ObjectId
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
            users = list(users_collection.find({}))
            
            # Convert ObjectId to string and datetime objects to strings
            for user in users:
                if '_id' in user:
                    user['_id'] = str(user['_id'])
                for key, value in user.items():
                    if hasattr(value, 'isoformat'):  # datetime object
                        user[key] = value.isoformat()
            
            return jsonify({'users': users})
        
        elif request.method == 'POST':
            body = request.get_json()
            if not body:
                return jsonify({'error': 'No JSON body provided'}), 400
            
            # Validate required fields
            if not body.get('name') or not body.get('email'):
                return jsonify({'error': 'Name and email are required'}), 400
            
            result = users_collection.insert_one(body)
            return jsonify({
                'message': 'User created', 
                'id': str(result.inserted_id)
            }), 201
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/users/<user_id>', methods=['PUT', 'DELETE'])
def user_by_id(user_id):
    try:
        # Validate ObjectId format
        try:
            ObjectId(user_id)
        except:
            return jsonify({'error': 'Invalid user ID format'}), 400

        db = get_db_connection()
        users_collection = db.users

        if request.method == 'PUT':
            body = request.get_json()
            if not body:
                return jsonify({'error': 'No JSON body provided'}), 400
            
            # Validate required fields
            if not body.get('name') or not body.get('email'):
                return jsonify({'error': 'Name and email are required'}), 400
            
            result = users_collection.update_one(
                {'_id': ObjectId(user_id)}, 
                {'$set': {'name': body['name'], 'email': body['email']}}
            )
            
            if result.matched_count == 0:
                return jsonify({'error': 'User not found'}), 404
            
            return jsonify({'message': 'User updated successfully'})
        
        elif request.method == 'DELETE':
            result = users_collection.delete_one({'_id': ObjectId(user_id)})
            
            if result.deleted_count == 0:
                return jsonify({'error': 'User not found'}), 404
            
            return jsonify({'message': 'User deleted successfully'})
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=3001)