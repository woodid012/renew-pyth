# api/users.py
from http.server import BaseHTTPRequestHandler
import json
import os
from pymongo import MongoClient
from bson import ObjectId
from urllib.parse import urlparse, parse_qs

class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        try:
            MONGODB_URI = os.environ.get('MONGODB_URI')
            if not MONGODB_URI:
                self.send_error_response(500, 'MONGODB_URI environment variable not set')
                return

            client = MongoClient(MONGODB_URI)
            db = client.get_database()
            users_collection = db.users
            
            users = list(users_collection.find({}))
            client.close()
            
            # Convert ObjectId to string and datetime objects to strings
            for user in users:
                if '_id' in user:
                    user['_id'] = str(user['_id'])
                for key, value in user.items():
                    if hasattr(value, 'isoformat'):  # datetime object
                        user[key] = value.isoformat()
            
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            
            response = {'users': users}
            self.wfile.write(json.dumps(response).encode())
            
        except Exception as e:
            self.send_error_response(500, str(e))

    def do_POST(self):
        try:
            MONGODB_URI = os.environ.get('MONGODB_URI')
            if not MONGODB_URI:
                self.send_error_response(500, 'MONGODB_URI environment variable not set')
                return

            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            body = json.loads(post_data.decode('utf-8'))
            
            # Validate required fields
            if not body.get('name') or not body.get('email'):
                self.send_error_response(400, 'Name and email are required')
                return
            
            client = MongoClient(MONGODB_URI)
            db = client.get_database()
            users_collection = db.users
            
            result = users_collection.insert_one(body)
            client.close()
            
            self.send_response(201)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            
            response = {'message': 'User created', 'id': str(result.inserted_id)}
            self.wfile.write(json.dumps(response).encode())
            
        except Exception as e:
            self.send_error_response(500, str(e))

    def do_PUT(self):
        try:
            # Parse URL to get user ID
            parsed_url = urlparse(self.path)
            path_parts = parsed_url.path.split('/')
            
            if len(path_parts) < 4 or not path_parts[3]:
                self.send_error_response(400, 'User ID is required in URL path')
                return
                
            user_id = path_parts[3]
            
            # Validate ObjectId format
            try:
                ObjectId(user_id)
            except:
                self.send_error_response(400, 'Invalid user ID format')
                return

            MONGODB_URI = os.environ.get('MONGODB_URI')
            if not MONGODB_URI:
                self.send_error_response(500, 'MONGODB_URI environment variable not set')
                return

            content_length = int(self.headers['Content-Length'])
            put_data = self.rfile.read(content_length)
            body = json.loads(put_data.decode('utf-8'))
            
            # Validate required fields
            if not body.get('name') or not body.get('email'):
                self.send_error_response(400, 'Name and email are required')
                return
            
            client = MongoClient(MONGODB_URI)
            db = client.get_database()
            users_collection = db.users
            
            result = users_collection.update_one(
                {'_id': ObjectId(user_id)}, 
                {'$set': {'name': body['name'], 'email': body['email']}}
            )
            client.close()
            
            if result.matched_count == 0:
                self.send_error_response(404, 'User not found')
                return
            
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            
            response = {'message': 'User updated successfully'}
            self.wfile.write(json.dumps(response).encode())
            
        except Exception as e:
            self.send_error_response(500, str(e))

    def do_DELETE(self):
        try:
            # Parse URL to get user ID
            parsed_url = urlparse(self.path)
            path_parts = parsed_url.path.split('/')
            
            if len(path_parts) < 4 or not path_parts[3]:
                self.send_error_response(400, 'User ID is required in URL path')
                return
                
            user_id = path_parts[3]
            
            # Validate ObjectId format
            try:
                ObjectId(user_id)
            except:
                self.send_error_response(400, 'Invalid user ID format')
                return

            MONGODB_URI = os.environ.get('MONGODB_URI')
            if not MONGODB_URI:
                self.send_error_response(500, 'MONGODB_URI environment variable not set')
                return
            
            client = MongoClient(MONGODB_URI)
            db = client.get_database()
            users_collection = db.users
            
            result = users_collection.delete_one({'_id': ObjectId(user_id)})
            client.close()
            
            if result.deleted_count == 0:
                self.send_error_response(404, 'User not found')
                return
            
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            
            response = {'message': 'User deleted successfully'}
            self.wfile.write(json.dumps(response).encode())
            
        except Exception as e:
            self.send_error_response(500, str(e))

    def do_OPTIONS(self):
        # Handle CORS preflight requests
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def send_error_response(self, status_code, error_message):
        self.send_response(status_code)
        self.send_header('Content-type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        
        response = {'error': error_message}
        self.wfile.write(json.dumps(response).encode())