import os
import json
from pymongo import MongoClient

def handler(request):
    client = None
    try:
        MONGODB_URI = os.environ.get('MONGODB_URI')
        if not MONGODB_URI:
            raise Exception('MONGODB_URI environment variable not set')

        client = MongoClient(MONGODB_URI)
        db = client.get_database()
        users_collection = db.users

        if request.method == 'GET':
            users = list(users_collection.find({}, {'_id': 0}))
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json'},
                'body': {'users': users}
            }
        
        elif request.method == 'POST':
            body = json.loads(request.body)
            result = users_collection.insert_one(body)
            return {
                'statusCode': 201,
                'headers': {'Content-Type': 'application/json'},
                'body': {'message': 'User created', 'id': str(result.inserted_id)}
            }
    
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json'},
            'body': {'error': str(e)}
        }
    
    finally:
        if client:
            client.close()