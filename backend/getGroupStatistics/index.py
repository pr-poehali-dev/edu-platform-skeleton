import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor
import jwt
from typing import Dict, Any, List

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Get homework statistics for group students
    Args: event with httpMethod, headers with X-Auth-Token, query params group_id and optional set_id
          context with request_id
    Returns: HTTP response with statistics per student
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
    
    query_params = event.get('queryStringParameters') or {}
    group_id = query_params.get('group_id')
    set_id = query_params.get('set_id')
    
    if not group_id:
        return {
            'statusCode': 400,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Укажите group_id'}),
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
    
    set_filter = f"AND hv.set_id = {set_id}" if set_id else ""
    
    cursor.execute(f"""
        SELECT 
            u.id as student_id,
            u.full_name,
            u.email,
            hv.id as variant_id,
            hv.set_id,
            hs.title as homework_title,
            hv.status as variant_status,
            hv.final_score,
            COUNT(vi.id) as total_tasks,
            COUNT(s.id) as submitted_tasks,
            SUM(CASE WHEN s.score IS NOT NULL THEN s.score ELSE 0 END) as current_score
        FROM users u
        JOIN enrollments e ON e.student_id = u.id
        LEFT JOIN homework_variants hv ON hv.student_id = u.id {set_filter}
        LEFT JOIN homework_sets hs ON hs.id = hv.set_id
        LEFT JOIN variant_items vi ON vi.variant_id = hv.id
        LEFT JOIN submissions s ON s.variant_item_id = vi.id AND s.student_id = u.id
        WHERE e.group_id = {group_id} AND u.role = 'student'
        GROUP BY u.id, u.full_name, u.email, hv.id, hv.set_id, hs.title, hv.status, hv.final_score
        ORDER BY u.full_name, hs.title
    """)
    
    stats_raw = cursor.fetchall()
    
    stats_list: List[Dict] = []
    for stat in stats_raw:
        stats_list.append({
            'student_id': stat['student_id'],
            'full_name': stat['full_name'],
            'email': stat['email'],
            'variant_id': stat['variant_id'],
            'set_id': stat['set_id'],
            'homework_title': stat['homework_title'],
            'variant_status': stat['variant_status'],
            'final_score': stat['final_score'],
            'total_tasks': stat['total_tasks'] or 0,
            'submitted_tasks': stat['submitted_tasks'] or 0,
            'current_score': stat['current_score'] or 0
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
            'statistics': stats_list
        }),
        'isBase64Encoded': False
    }
