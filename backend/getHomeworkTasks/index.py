import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor
import jwt
from typing import Dict, Any, List

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Get tasks for specific homework variant with submission status
    Args: event with httpMethod, headers with X-Auth-Token, query param variant_id
          context with request_id
    Returns: HTTP response with list of tasks and submissions
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    if method != 'GET':
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
        user_id = payload.get('id')
        role = payload.get('role')
        
        if role != 'student':
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
    
    query_params = event.get('queryStringParameters') or {}
    variant_id = query_params.get('variant_id')
    
    if not variant_id:
        return {
            'statusCode': 400,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Укажите variant_id'}),
            'isBase64Encoded': False
        }
    
    conn = psycopg2.connect(database_url)
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    
    cursor.execute(f"SELECT student_id FROM homework_variants WHERE id = {variant_id}")
    variant = cursor.fetchone()
    
    if not variant:
        cursor.close()
        conn.close()
        return {
            'statusCode': 404,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Вариант не найден'}),
            'isBase64Encoded': False
        }
    
    if variant['student_id'] != user_id:
        cursor.close()
        conn.close()
        return {
            'statusCode': 403,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Доступ запрещен'}),
            'isBase64Encoded': False
        }
    
    cursor.execute(f"""
        SELECT 
            vi.id as variant_item_id,
            t.id as task_id,
            t.title,
            t.text,
            t.type,
            t.ege_number,
            t.difficulty,
            s.id as submission_id,
            s.answer_text,
            s.answer_file_url,
            s.answer_code,
            s.answer_image_url,
            s.answer_table_json,
            s.score,
            s.status as submission_status,
            s.created_at as submitted_at
        FROM variant_items vi
        JOIN tasks t ON t.id = vi.task_id
        LEFT JOIN submissions s ON s.variant_item_id = vi.id AND s.student_id = {user_id}
        WHERE vi.variant_id = {variant_id}
        ORDER BY vi.id
    """)
    
    tasks_raw = cursor.fetchall()
    
    tasks_list: List[Dict] = []
    for task in tasks_raw:
        tasks_list.append({
            'variant_item_id': task['variant_item_id'],
            'task_id': task['task_id'],
            'title': task['title'],
            'text': task['text'],
            'type': task['type'],
            'ege_number': task['ege_number'],
            'difficulty': task['difficulty'],
            'submission': {
                'id': task['submission_id'],
                'answer_text': task['answer_text'],
                'answer_file_url': task['answer_file_url'],
                'answer_code': task['answer_code'],
                'answer_image_url': task['answer_image_url'],
                'answer_table_json': task['answer_table_json'],
                'score': task['score'],
                'status': task['submission_status'],
                'submitted_at': task['submitted_at'].isoformat() if task['submitted_at'] else None
            } if task['submission_id'] else None
        })
    
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
            'tasks': tasks_list
        }),
        'isBase64Encoded': False
    }