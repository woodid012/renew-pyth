# api/users.py
from http.server import BaseHTTPRequestHandler
import json
import os
from pymongo import MongoClient

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
            
            users = list(users_collection.find({}, {'_id': 0}))
            client.close()
            
            # Convert any datetime objects to strings
            for user in users:
                for key, value in user.items():
                    if hasattr(value, 'isoformat'):  # datetime object
                        user[key] = value.isoformat()
            
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
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
            
            client = MongoClient(MONGODB_URI)
            db = client.get_database()
            users_collection = db.users
            
            result = users_collection.insert_one(body)
            client.close()
            
            self.send_response(201)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            
            response = {'message': 'User created', 'id': str(result.inserted_id)}
            self.wfile.write(json.dumps(response).encode())
            
        except Exception as e:
            self.send_error_response(500, str(e))

    def send_error_response(self, status_code, error_message):
        self.send_response(status_code)
        self.send_header('Content-type', 'application/json')
        self.end_headers()
        
        response = {'error': error_message}
        self.wfile.write(json.dumps(response).encode())