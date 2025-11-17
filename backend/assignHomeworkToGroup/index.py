import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor
import jwt
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Assign homework set to all students in group
    Args: event with httpMethod, headers with X-Auth-Token, body with set_id and group_id
          context with request_id
    Returns: HTTP response with created variants count
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
    set_id: int = body_data.get('set_id')
    group_id: int = body_data.get('group_id')
    
    if not set_id or not group_id:
        return {
            'statusCode': 400,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Укажите set_id и group_id'}),
            'isBase64Encoded': False
        }
    
    conn = psycopg2.connect(database_url)
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    
    cursor.execute(f"SELECT teacher_id FROM groups WHERE id = {group_id}")
    group = cursor.fetchone()
    
    if not group:
        cursor.close()
        conn.close()
        return {
            'statusCode': 404,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Группа не найдена'}),
            'isBase64Encoded': False
        }
    
    if group['teacher_id'] != teacher_id:
        cursor.close()
        conn.close()
        return {
            'statusCode': 403,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Группа не принадлежит вам'}),
            'isBase64Encoded': False
        }
    
    cursor.execute(f"SELECT created_by FROM homework_sets WHERE id = {set_id}")
    hw_set = cursor.fetchone()
    
    if not hw_set:
        cursor.close()
        conn.close()
        return {
            'statusCode': 404,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'ДЗ не найдено'}),
            'isBase64Encoded': False
        }
    
    if hw_set['created_by'] != teacher_id:
        cursor.close()
        conn.close()
        return {
            'statusCode': 403,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'ДЗ не принадлежит вам'}),
            'isBase64Encoded': False
        }
    
    cursor.execute(f"""
        SELECT u.id FROM users u
        JOIN enrollments e ON e.student_id = u.id
        WHERE e.group_id = {group_id} AND u.role = 'student'
    """)
    students = cursor.fetchall()
    
    if not students:
        cursor.close()
        conn.close()
        return {
            'statusCode': 400,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'В группе нет студентов'}),
            'isBase64Encoded': False
        }
    
    cursor.execute(f"SELECT task_id FROM homework_tasks WHERE set_id = {set_id}")
    tasks = cursor.fetchall()
    
    variants_created = 0
    
    for student in students:
        student_id = student['id']
        
        cursor.execute(f"""
            SELECT id FROM homework_variants 
            WHERE set_id = {set_id} AND student_id = {student_id}
        """)
        existing = cursor.fetchone()
        
        if existing:
            continue
        
        cursor.execute(f"""
            INSERT INTO homework_variants (set_id, student_id, status)
            VALUES ({set_id}, {student_id}, 'assigned')
            RETURNING id
        """)
        variant = cursor.fetchone()
        variant_id = variant['id']
        
        for task in tasks:
            cursor.execute(f"""
                INSERT INTO variant_items (variant_id, task_id)
                VALUES ({variant_id}, {task['task_id']})
            """)
        
        variants_created += 1
    
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
            'variants_created': variants_created,
            'total_students': len(students)
        }),
        'isBase64Encoded': False
    }
