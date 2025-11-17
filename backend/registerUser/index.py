import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor
import hashlib
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Register new user with email, password and role
    Args: event with httpMethod, body containing full_name, email, password, role
          context with request_id
    Returns: HTTP response with user_id or error
    '''
    method: str = event.get('httpMethod', 'POST')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
    
    body_data = json.loads(event.get('body', '{}'))
    full_name: str = body_data.get('full_name', '').strip()
    email: str = body_data.get('email', '').strip().lower()
    password: str = body_data.get('password', '')
    role: str = body_data.get('role', 'student')
    
    if not email or not password:
        return {
            'statusCode': 400,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Email и пароль обязательны'}),
            'isBase64Encoded': False
        }
    
    if len(password) < 6:
        return {
            'statusCode': 400,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Пароль должен содержать минимум 6 символов'}),
            'isBase64Encoded': False
        }
    
    if role not in ['student', 'teacher']:
        return {
            'statusCode': 400,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Роль должна быть student или teacher'}),
            'isBase64Encoded': False
        }
    
    database_url = os.environ.get('DATABASE_URL')
    if not database_url:
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Database configuration error'}),
            'isBase64Encoded': False
        }
    
    conn = psycopg2.connect(database_url)
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    
    email_escaped = email.replace("'", "''")
    cursor.execute(f"SELECT id FROM users WHERE email = '{email_escaped}'")
    existing_user = cursor.fetchone()
    
    if existing_user:
        cursor.close()
        conn.close()
        return {
            'statusCode': 400,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Пользователь с таким email уже существует'}),
            'isBase64Encoded': False
        }
    
    system_salt = os.environ.get('SYSTEM_SALT', '')
    password_hash = hashlib.sha256((password + system_salt).encode()).hexdigest()
    
    full_name_escaped = full_name.replace("'", "''")
    cursor.execute(f"""
        INSERT INTO users (full_name, email, password_hash, role) 
        VALUES ('{full_name_escaped}', '{email_escaped}', '{password_hash}', '{role}') 
        RETURNING id
    """)
    result = cursor.fetchone()
    user_id = result['id']
    
    conn.commit()
    cursor.close()
    conn.close()
    
    return {
        'statusCode': 200,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'body': json.dumps({
            'success': True,
            'user_id': user_id
        }),
        'isBase64Encoded': False
    }