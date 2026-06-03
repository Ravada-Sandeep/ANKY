from flask import request, jsonify
from db import mysql
from flask_jwt_extended import jwt_required, get_jwt_identity

@jwt_required()
def add_flashcard():
    user_id = int(get_jwt_identity())
    
    data = request.get_json()

    topic_id = data.get('topic_id')
    question = data.get('question')
    answer = data.get('answer')

    if not topic_id or not question or not answer:
        return jsonify({"error": "Missing data"}), 400

    cur = mysql.connection.cursor()

    query ='''
        SELECT t.id
        FROM topics t
        JOIN subjects s ON t.subject_id = s.id
        WHERE t.id=%s AND s.user_id=%s
    '''
    cur.execute(query, (topic_id, user_id))
    
    if not cur.fetchone():
        cur.close()
        return jsonify({'message': 'unauthorized'}), 403

    cur.execute('''
        INSERT INTO flashcards(topic_id, question, answer)
        VALUES (%s,%s,%s)
    ''', (topic_id, question, answer))

    mysql.connection.commit()
    cur.close()

    return jsonify({"message": "Flashcard added successfully"}), 201


@jwt_required()
def get_flashcards(topic_id):
    user_id = int(get_jwt_identity())

    cur = mysql.connection.cursor()

    query =  '''
    SELECT f.*
    FROM flashcards f
    JOIN topics t ON f.topic_id = t.id
    JOIN subjects s ON t.subject_id = s.id
    WHERE f.topic_id = %s AND s.user_id = %s
    '''
    cur.execute(query, (topic_id,user_id))
    rows = cur.fetchall()

    if not rows:
        cur.close()
        return jsonify({"message": "No flashcards found"}), 404

    flashcards = []
    for row in rows:
        flashcards.append({
            "id": row[0],
            "topic_id": row[1],
            "question": row[2],
            "answer": row[3],
            "next_review_date": str(row[4]) if row[4] else None,
            "interval_days": row[5],
            "last_reviewed": str(row[6]) if row[6] else None,
            "correct_attempts": row[7],
            "total_attempts": row[8],
            "retention_score": row[9],
            "created_at": str(row[10])
        })

    cur.close()
    return jsonify(flashcards), 200

@jwt_required()
def delete_flashcard(flashcard_id):

    cur = mysql.connection.cursor()

    cur.execute(
        "DELETE FROM flashcards WHERE id=%s",
        (flashcard_id,)
    )

    mysql.connection.commit()

    cur.close()

    return jsonify({
        "message": "Flashcard deleted"
    }), 200