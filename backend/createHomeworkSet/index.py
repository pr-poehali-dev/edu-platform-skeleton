import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor
import jwt
from typing import Dict, Any, List

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Create homework set with selected tasks
    Args: event with httpMethod, headers with X-Auth-Token, body with title, description, task_ids
          context with request_id
    Returns: HTTP response with created homework set
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
    description: str = body_data.get('description', '').strip()
    task_ids: List[int] = body_data.get('task_ids', [])
    
    if not title:
        return {
            'statusCode': 400,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Укажите название ДЗ'}),
            'isBase64Encoded': False
        }
    
    if not task_ids or len(task_ids) == 0:
        return {
            'statusCode': 400,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Выберите хотя бы одну задачу'}),
            'isBase64Encoded': False
        }
    
    conn = psycopg2.connect(database_url)
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    
    title_escaped = title.replace("'", "''")
    description_escaped = description.replace("'", "''") if description else ''
    
    cursor.execute(f"""
        INSERT INTO homework_sets (title, description, created_by) 
        VALUES ('{title_escaped}', '{description_escaped}', {teacher_id}) 
        RETURNING id, title, description, created_at
    """)
    homework_set = cursor.fetchone()
    set_id = homework_set['id']
    
    task_ids_str = ','.join(map(str, task_ids))
    cursor.execute(f"""
        SELECT id FROM tasks 
        WHERE id IN ({task_ids_str}) AND created_by = {teacher_id}
    """)
    valid_tasks = cursor.fetchall()
    
    if len(valid_tasks) != len(task_ids):
        conn.rollback()
        cursor.close()
        conn.close()
        return {
            'statusCode': 400,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Некоторые задачи не найдены или не принадлежат вам'}),
            'isBase64Encoded': False
        }
    
    for task_id in task_ids:
        cursor.execute(f"""
            INSERT INTO homework_tasks (set_id, task_id) 
            VALUES ({set_id}, {task_id})
        """)
    
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
            'homework_set': {
                'id': homework_set['id'],
                'title': homework_set['title'],
                'description': homework_set['description'],
                'created_at': homework_set['created_at'].isoformat() if homework_set['created_at'] else None,
                'task_count': len(task_ids)
            }
        }),
        'isBase64Encoded': False
    }