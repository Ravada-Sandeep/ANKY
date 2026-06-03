from flask import request,jsonify
from  db import mysql
from flask_jwt_extended import create_access_token
import bcrypt

def register():
    data=request.get_json()
    name=data.get('name')
    email=data.get('email')
    password=data.get('password')
    
    if not email or not password:
        return jsonify({'message':'email and password required'}),400
    
    cur=mysql.connection.cursor()
    query='select * from users where email=%s'
    cur.execute(query,(email,))
    if cur.fetchone():
        cur.close()
        return jsonify({'message':'user already exists'}),409
    
    hashed=bcrypt.hashpw(password.encode('utf-8'),bcrypt.gensalt())
    cur.execute('insert into users(name,email,password) values(%s,%s,%s)',(name,email,hashed))
    mysql.connection.commit()
    cur.close()
    return jsonify({'message': 'User registered successfully'}), 201
    
def login():
    data=request.get_json()
    email=data.get('email')
    password=data.get('password')
    if not email or not password:
        return jsonify({'message':'enter credentials'}),400
    cur=mysql.connection.cursor()
    query='select id,password from users where email=%s'
    cur.execute(query,(email,))
    user=cur.fetchone()
    cur.close()
    if not user:
        return jsonify({'message':'user not found'}),404
    if bcrypt.checkpw(password.encode('utf-8'),user[1].encode('utf-8')):
        token=create_access_token(identity=str(user[0]))
        return jsonify({'token': token}),200
    return jsonify({'message':'invalid password'}),401