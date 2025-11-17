import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor
import jwt
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Add student to group by email
    Args: event with httpMethod, headers with X-Auth-Token, body with group_id and student_email
          context with request_id
    Returns: HTTP response with enrollment info
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
    group_id: int = body_data.get('group_id')
    student_email: str = body_data.get('student_email', '').strip()
    
    if not group_id or not student_email:
        return {
            'statusCode': 400,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Укажите ID группы и email студента'}),
            'isBase64Encoded': False
        }
    
    conn = psycopg2.connect(database_url)
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    
    cursor.execute("SET search_path TO t_p78721878_edu_platform_skeleto")
    cursor.execute(f"SELECT id, teacher_id FROM groups WHERE id = {group_id}")
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
            'body': json.dumps({'error': 'Вы не являетесь владельцем этой группы'}),
            'isBase64Encoded': False
        }
    
    email_escaped = student_email.replace("'", "''")
    cursor.execute(f"SELECT id, full_name, role FROM users WHERE email = '{email_escaped}'")
    student = cursor.fetchone()
    
    if not student:
        cursor.close()
        conn.close()
        return {
            'statusCode': 404,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Пользователь с таким email не найден'}),
            'isBase64Encoded': False
        }
    
    if student['role'] != 'student':
        cursor.close()
        conn.close()
        return {
            'statusCode': 400,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Пользователь не является студентом'}),
            'isBase64Encoded': False
        }
    
    cursor.execute(f"SELECT id FROM enrollments WHERE group_id = {group_id} AND student_id = {student['id']}")
    existing = cursor.fetchone()
    
    if existing:
        cursor.close()
        conn.close()
        return {
            'statusCode': 400,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Студент уже добавлен в группу'}),
            'isBase64Encoded': False
        }
    
    cursor.execute(f"""
        INSERT INTO enrollments (group_id, student_id) 
        VALUES ({group_id}, {student['id']}) 
        RETURNING id, group_id, student_id, enrolled_at
    """)
    result = cursor.fetchone()
    
    conn.commit()
    cursor.close()
    conn.close()
    
    enrolled_at_str = str(result['enrolled_at']) if result['enrolled_at'] else None
    
    return {
        'statusCode': 200,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'body': json.dumps({
            'success': True,
            'enrollment': {
                'enrollment_id': result['id'],
                'student_id': result['student_id'],
                'full_name': student['full_name'],
                'email': student_email,
                'enrolled_at': enrolled_at_str
            }
        }),
        'isBase64Encoded': False
    }