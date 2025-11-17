import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor
import jwt
from typing import Dict, Any, List

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Get student dashboard data including homework, debts, and history
    Args: event with httpMethod, headers containing X-Auth-Token
          context with request_id
    Returns: HTTP response with student assignments, debts, and completed tasks
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
    except jwt.ExpiredSignatureError:
        return {
            'statusCode': 401,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Токен истек'}),
            'isBase64Encoded': False
        }
    except jwt.InvalidTokenError:
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
    
    cursor.execute("""
        SELECT 
            hv.id as variant_id,
            hv.status as variant_status,
            hv.created_at,
            hs.title as homework_title,
            hs.description as homework_description,
            COUNT(vi.id) as total_tasks,
            COUNT(CASE WHEN s.status = 'checked' THEN 1 END) as checked_tasks,
            AVG(CASE WHEN s.score IS NOT NULL THEN s.score END) as avg_score
        FROM homework_variants hv
        JOIN homework_sets hs ON hv.set_id = hs.id
        LEFT JOIN variant_items vi ON vi.variant_id = hv.id
        LEFT JOIN submissions s ON s.variant_item_id = vi.id AND s.student_id = %s
        WHERE hv.student_id = %s
        GROUP BY hv.id, hv.status, hv.created_at, hs.title, hs.description
        ORDER BY hv.created_at DESC
    """, (student_id, student_id))
    
    variants = cursor.fetchall()
    
    active_homework: List[Dict] = []
    debts: List[Dict] = []
    history: List[Dict] = []
    
    for variant in variants:
        variant_data = {
            'id': variant['variant_id'],
            'title': variant['homework_title'],
            'description': variant['homework_description'],
            'status': variant['variant_status'],
            'total_tasks': variant['total_tasks'] or 0,
            'checked_tasks': variant['checked_tasks'] or 0,
            'avg_score': round(variant['avg_score']) if variant['avg_score'] else None,
            'created_at': variant['created_at'].isoformat() if variant['created_at'] else None
        }
        
        if variant['variant_status'] == 'checked':
            history.append(variant_data)
        elif variant['variant_status'] in ['submitted'] or (variant['avg_score'] and variant['avg_score'] < 90):
            debts.append(variant_data)
        else:
            active_homework.append(variant_data)
    
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
            'data': {
                'active_homework': active_homework,
                'debts': debts,
                'history': history,
                'stats': {
                    'total_active': len(active_homework),
                    'total_debts': len(debts),
                    'total_completed': len(history)
                }
            }
        }),
        'isBase64Encoded': False
    }
