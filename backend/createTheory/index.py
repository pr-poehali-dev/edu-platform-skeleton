import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor
import jwt
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Create theory material with optional file
    Args: event with httpMethod, headers with X-Auth-Token, body with title, content, ege_number, file_url
          context with request_id
    Returns: HTTP response with created theory
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
    content: str = body_data.get('content', '').strip()
    ege_number: int = body_data.get('ege_number', 0)
    file_url: str = body_data.get('file_url', '').strip()
    
    if not title or not content:
        return {
            'statusCode': 400,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Укажите название и содержание'}),
            'isBase64Encoded': False
        }
    
    if not ege_number or ege_number < 1 or ege_number > 27:
        return {
            'statusCode': 400,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Укажите номер ЕГЭ от 1 до 27'}),
            'isBase64Encoded': False
        }
    
    conn = psycopg2.connect(database_url)
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    
    title_escaped = title.replace("'", "''")
    content_escaped = content.replace("'", "''")
    file_url_escaped = file_url.replace("'", "''") if file_url else ''
    
    if file_url:
        cursor.execute(f"""
            INSERT INTO theory (title, content, ege_number, file_url, created_by)
            VALUES ('{title_escaped}', '{content_escaped}', {ege_number}, '{file_url_escaped}', {teacher_id})
            RETURNING id, title, content, ege_number, file_url, created_at
        """)
    else:
        cursor.execute(f"""
            INSERT INTO theory (title, content, ege_number, created_by)
            VALUES ('{title_escaped}', '{content_escaped}', {ege_number}, {teacher_id})
            RETURNING id, title, content, ege_number, file_url, created_at
        """)
    
    theory = cursor.fetchone()
    
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
            'theory': {
                'id': theory['id'],
                'title': theory['title'],
                'content': theory['content'],
                'ege_number': theory['ege_number'],
                'file_url': theory['file_url'],
                'created_at': theory['created_at'].isoformat() if theory['created_at'] else None
            }
        }),
        'isBase64Encoded': False
    }
