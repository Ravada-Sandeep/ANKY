from flask import jsonify
from db import mysql
from flask_jwt_extended import jwt_required, get_jwt_identity


@jwt_required()
def dashboard_summary():

    user_id = int(get_jwt_identity())

    cur = mysql.connection.cursor()

   
    cur.execute("""
        SELECT COUNT(*)
        FROM subjects
        WHERE user_id=%s
    """, (user_id,))
    subjects = cur.fetchone()[0]

   
    cur.execute("""
        SELECT COUNT(*)
        FROM topics t
        JOIN subjects s
        ON t.subject_id=s.id
        WHERE s.user_id=%s
    """, (user_id,))
    topics = cur.fetchone()[0]

    cur.execute("""
        SELECT COUNT(*)
        FROM flashcards f
        JOIN topics t
        ON f.topic_id=t.id
        JOIN subjects s
        ON t.subject_id=s.id
        WHERE s.user_id=%s
    """, (user_id,))
    flashcards = cur.fetchone()[0]


    cur.execute("""
        SELECT COUNT(*)
        FROM flashcards f
        JOIN topics t
        ON f.topic_id=t.id
        JOIN subjects s
        ON t.subject_id=s.id
        WHERE s.user_id=%s
        AND (
            f.next_review_date IS NULL
            OR f.next_review_date <= CURRENT_DATE
        )
    """, (user_id,))
    due_today = cur.fetchone()[0]

    
    cur.execute("""
        SELECT ROUND(AVG(retention_score),2)
        FROM flashcards f
        JOIN topics t
        ON f.topic_id=t.id
        JOIN subjects s
        ON t.subject_id=s.id
        WHERE s.user_id=%s
    """, (user_id,))

    avg_retention = cur.fetchone()[0]

    if avg_retention is None:
        avg_retention = 0

    cur.close()

    return jsonify({
        "subjects": subjects,
        "topics": topics,
        "flashcards": flashcards,
        "due_today": due_today,
        "avg_retention": avg_retention
    }), 200


@jwt_required()
def due_flashcards():

    user_id = int(get_jwt_identity())

    cur = mysql.connection.cursor()

    cur.execute("""
        SELECT
            f.id,
            f.question,
            f.answer,
            f.next_review_date,
            f.retention_score,
            t.topic_name,
            s.subject_name
        FROM flashcards f
        JOIN topics t
        ON f.topic_id=t.id
        JOIN subjects s
        ON t.subject_id=s.id
        WHERE s.user_id=%s
        AND (
            f.next_review_date IS NULL
            OR f.next_review_date <= CURRENT_DATE
        )
        ORDER BY
            f.next_review_date ASC
    """, (user_id,))

    rows = cur.fetchall()

    cur.close()

    due_cards = []

    for row in rows:
        due_cards.append({
            "id": row[0],
            "question": row[1],
            "answer": row[2],
            "next_review_date": str(row[3]) if row[3] else None,
            "retention_score": row[4],
            "topic_name": row[5],
            "subject_name": row[6]
        })

    return jsonify(due_cards), 200