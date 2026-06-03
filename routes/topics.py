from flask import request,jsonify
from db import mysql
from flask_jwt_extended import jwt_required, get_jwt_identity

@jwt_required()
def add_topic():
    
    user_id = int(get_jwt_identity())
    
    data=request.get_json()
    subject_id=data.get('subject_id')
    topic_name=data.get('topic_name')
    if not subject_id or not topic_name:
        return jsonify({'error':'missing data'}),400
    cur=mysql.connection.cursor()
    cur.execute(
        "select * from subjects where id=%s and user_id=%s",
        (subject_id, user_id)
    )

    if not cur.fetchone():
        cur.close()
        return jsonify({'message': 'unauthorized'}), 403
    query='insert into topics(subject_id,topic_name) values(%s,%s)'
    cur.execute(query,(subject_id,topic_name))
    mysql.connection.commit()
    cur.close()
    return jsonify({'message':'topic added successfully'}), 201


@jwt_required()
def get_topics(subject_id):
    user_id = int(get_jwt_identity())
    
    cur=mysql.connection.cursor()
    query='''
    SELECT t.*
    FROM topics t
    JOIN subjects s ON t.subject_id = s.id
    WHERE s.user_id = %s AND t.subject_id = %s
    '''
    cur.execute(query,(user_id,subject_id))
    data=cur.fetchall()
    if not data:
        cur.close()
        return jsonify({"message": "No topics found"}), 404
    topics=[]
    for row in data:
        topics.append({
            "id": row[0],
            "subject_id": row[1],
            "topic_name": row[2],
            "created_at": str(row[3])
        })
    cur.close()
    return jsonify(topics), 200

@jwt_required()
def delete_topic(topic_id):

    cur = mysql.connection.cursor()

    cur.execute(
        "DELETE FROM topics WHERE id=%s",
        (topic_id,)
    )

    mysql.connection.commit()

    cur.close()

    return jsonify({
        "message": "Topic deleted"
    }), 200