from flask import request,jsonify
from db import mysql
from flask_jwt_extended import jwt_required, get_jwt_identity

@jwt_required()
def add_subject():
    user_id = int(get_jwt_identity())
    
    data=request.get_json()
    name=data.get('subject_name')
    if not name :
        return jsonify({'error':'missing data'}),400
    cur=mysql.connection.cursor()
    cur.execute(
    "select * from subjects where user_id=%s and subject_name=%s",
    (user_id, name)
)

    if cur.fetchone():
        cur.close()
        return jsonify({"message":"Subject already exists"}),409
    query='insert into subjects(user_id,subject_name) values(%s,%s)'
    cur.execute(query,(user_id,name))
    mysql.connection.commit()
    cur.close()
    return jsonify({'message':'subject added successfully'})


@jwt_required()
def get_subjects():
    user_id = int(get_jwt_identity())
    
    cur=mysql.connection.cursor()
    query='select * from subjects where user_id=%s'
    cur.execute(query,(user_id,))
    data=cur.fetchall()
    if not data:
        cur.close()
        return jsonify({"message": "No subjects found"}), 404
    sub=[]
    for row in data:
        sub.append({
            "id": row[0],
            "user_id": row[1],
            "subject_name": row[2],
            "created_at": str(row[3])
        })
    cur.close()
    return jsonify(sub)

@jwt_required()
def delete_subject(subject_id):

    cur = mysql.connection.cursor()

    cur.execute(
        "DELETE FROM subjects WHERE id=%s",
        (subject_id,)
    )

    mysql.connection.commit()

    cur.close()

    return jsonify({
        "message": "Subject deleted"
    }), 200