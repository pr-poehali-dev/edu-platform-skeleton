import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor
import jwt
from typing import Dict, Any, List

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Get all homework assigned to student
    Args: event with httpMethod, headers with X-Auth-Token
          context with request_id
    Returns: HTTP response with list of homework variants
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
        student_id = payload.get('id')
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
    
    conn = psycopg2.connect(database_url)
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    
    cursor.execute(f"""
        SELECT 
            hv.id as variant_id,
            hv.status,
            hv.created_at,
            hv.final_score,
            hs.id as set_id,
            hs.title,
            hs.description,
            COUNT(vi.id) as task_count,
            COUNT(CASE WHEN s.status = 'submitted' THEN 1 END) as submitted_count
        FROM homework_variants hv
        JOIN homework_sets hs ON hs.id = hv.set_id
        LEFT JOIN variant_items vi ON vi.variant_id = hv.id
        LEFT JOIN submissions s ON s.variant_item_id = vi.id AND s.student_id = {student_id}
        WHERE hv.student_id = {student_id}
        GROUP BY hv.id, hv.status, hv.created_at, hv.final_score, hs.id, hs.title, hs.description
        ORDER BY hv.created_at DESC
    """)
    
    homework_raw = cursor.fetchall()
    
    homework_list: List[Dict] = []
    for hw in homework_raw:
        homework_list.append({
            'variant_id': hw['variant_id'],
            'set_id': hw['set_id'],
            'title': hw['title'],
            'description': hw['description'],
            'status': hw['status'],
            'created_at': hw['created_at'].isoformat() if hw['created_at'] else None,
            'final_score': hw['final_score'],
            'task_count': hw['task_count'] or 0,
            'submitted_count': hw['submitted_count'] or 0
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
            'homework': homework_list
        }),
        'isBase64Encoded': False
    }
