import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor
import jwt
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Create new task in task bank
    Args: event with httpMethod, headers with X-Auth-Token, body with task data
          context with request_id
    Returns: HTTP response with created task
    '''
    method: str = event.get('httpMethod', 'POST')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token',
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
    
    headers = event.get('headers', {})
    token = headers.get('X-Auth-Token') or headers.get('x-auth-token')
    
    if not token:
        return {
            'statusCode': 401,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Токен не предоставлен'}),
            'isBase64Encoded': False
        }
    
    jwt_secret = os.environ.get('JWT_SECRET')
    database_url = os.environ.get('DATABASE_URL')
    
    if not jwt_secret or not database_url:
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Server configuration error'}),
            'isBase64Encoded': False
        }
    
    try:
        payload = jwt.decode(token, jwt_secret, algorithms=['HS256'])
        teacher_id = payload.get('id')
        role = payload.get('role')
        
        if role != 'teacher':
            return {
                'statusCode': 403,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'Доступ запрещен'}),
                'isBase64Encoded': False
            }
    except:
        return {
            'statusCode': 401,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Неверный токен'}),
            'isBase64Encoded': False
        }
    
    body_data = json.loads(event.get('body', '{}'))
    title: str = body_data.get('title', '').strip()
    text: str = body_data.get('text', '').strip()
    topic: str = body_data.get('topic', '').strip()
    difficulty: int = body_data.get('difficulty', 1)
    task_type: str = body_data.get('type', 'text')
    ege_number: int = body_data.get('ege_number', 1)
    
    if not title or not text:
        return {
            'statusCode': 400,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Название и условие задачи обязательны'}),
            'isBase64Encoded': False
        }
    
    conn = psycopg2.connect(database_url)
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    
    title_escaped = title.replace("'", "''")
    text_escaped = text.replace("'", "''")
    topic_escaped = topic.replace("'", "''")
    
    cursor.execute(f"""
        INSERT INTO tasks (title, text, topic, difficulty, type, ege_number, created_by) 
        VALUES ('{title_escaped}', '{text_escaped}', '{topic_escaped}', {difficulty}, '{task_type}', {ege_number}, {teacher_id}) 
        RETURNING id, title, text, topic, difficulty, type, ege_number, created_at
    """)
    result = cursor.fetchone()
    
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
            'task': {
                'id': result['id'],
                'title': result['title'],
                'text': result['text'],
                'topic': result['topic'],
                'difficulty': result['difficulty'],
                'type': result['type'],
                'ege_number': result['ege_number'],
                'created_at': result['created_at'].isoformat() if result['created_at'] else None
            }
        }),
        'isBase64Encoded': False
    }
