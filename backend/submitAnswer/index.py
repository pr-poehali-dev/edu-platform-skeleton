import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor
import jwt
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Submit answer for task in homework variant
    Args: event with httpMethod, headers with X-Auth-Token, body with variant_item_id and answer data
          context with request_id
    Returns: HTTP response with submission info
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
    
    body_data = json.loads(event.get('body', '{}'))
    variant_item_id: int = body_data.get('variant_item_id')
    answer_text: str = body_data.get('answer_text', '').strip()
    answer_file_url: str = body_data.get('answer_file_url', '').strip()
    answer_code: str = body_data.get('answer_code', '').strip()
    answer_image_url: str = body_data.get('answer_image_url', '').strip()
    answer_table_json: str = body_data.get('answer_table_json', '').strip()
    
    if not variant_item_id:
        return {
            'statusCode': 400,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Укажите variant_item_id'}),
            'isBase64Encoded': False
        }
    
    if not any([answer_text, answer_file_url, answer_code, answer_image_url, answer_table_json]):
        return {
            'statusCode': 400,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Укажите хотя бы один вариант ответа'}),
            'isBase64Encoded': False
        }
    
    conn = psycopg2.connect(database_url)
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    
    cursor.execute(f"""
        SELECT vi.variant_id, hv.student_id 
        FROM variant_items vi
        JOIN homework_variants hv ON hv.id = vi.variant_id
        WHERE vi.id = {variant_item_id}
    """)
    item = cursor.fetchone()
    
    if not item:
        cursor.close()
        conn.close()
        return {
            'statusCode': 404,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Задание не найдено'}),
            'isBase64Encoded': False
        }
    
    if item['student_id'] != student_id:
        cursor.close()
        conn.close()
        return {
            'statusCode': 403,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Задание не принадлежит вам'}),
            'isBase64Encoded': False
        }
    
    answer_text_escaped = answer_text.replace("'", "''") if answer_text else ''
    answer_file_url_escaped = answer_file_url.replace("'", "''") if answer_file_url else ''
    answer_code_escaped = answer_code.replace("'", "''") if answer_code else ''
    answer_image_url_escaped = answer_image_url.replace("'", "''") if answer_image_url else ''
    answer_table_json_escaped = answer_table_json.replace("'", "''") if answer_table_json else ''
    
    cursor.execute(f"""
        SELECT id FROM submissions 
        WHERE variant_item_id = {variant_item_id} AND student_id = {student_id}
    """)
    existing = cursor.fetchone()
    
    if existing:
        cursor.execute(f"""
            UPDATE submissions SET
                answer_text = '{answer_text_escaped}',
                answer_file_url = '{answer_file_url_escaped}',
                answer_code = '{answer_code_escaped}',
                answer_image_url = '{answer_image_url_escaped}',
                answer_table_json = '{answer_table_json_escaped}',
                status = 'submitted',
                updated_at = CURRENT_TIMESTAMP
            WHERE id = {existing['id']}
            RETURNING id, status, created_at, updated_at
        """)
    else:
        cursor.execute(f"""
            INSERT INTO submissions (
                student_id, variant_item_id, 
                answer_text, answer_file_url, answer_code, answer_image_url, answer_table_json,
                status
            )
            VALUES (
                {student_id}, {variant_item_id},
                '{answer_text_escaped}', '{answer_file_url_escaped}', '{answer_code_escaped}', 
                '{answer_image_url_escaped}', '{answer_table_json_escaped}',
                'submitted'
            )
            RETURNING id, status, created_at, updated_at
        """)
    
    submission = cursor.fetchone()
    
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
            'submission': {
                'id': submission['id'],
                'status': submission['status'],
                'created_at': submission['created_at'].isoformat() if submission['created_at'] else None,
                'updated_at': submission['updated_at'].isoformat() if submission['updated_at'] else None
            }
        }),
        'isBase64Encoded': False
    }
