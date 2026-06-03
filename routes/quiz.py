from flask import request,jsonify
from db import mysql
from flask_jwt_extended import jwt_required, get_jwt_identity


@jwt_required()
def get_quiz(topic_id):
    user_id=int(get_jwt_identity())
    cur=mysql.connection.cursor()
    query = '''
    SELECT f.id, f.question
    FROM flashcards f
    JOIN topics t ON f.topic_id = t.id
    JOIN subjects s ON t.subject_id = s.id
    WHERE s.user_id = %s
    AND f.topic_id = %s
    ORDER BY RAND()
    LIMIT 5
    '''
    cur.execute(query,(user_id,topic_id))
    rows=cur.fetchall()
    cur.close()
    if not rows:
        return jsonify({'message':'no questions found'}),404
    quiz=[]
    for row in rows:
        quiz.append({
            'flashcard_id':row[0],
            'question':row[1]
        })
    print("JWT USER ID:", user_id)
    return jsonify(quiz),200


@jwt_required()
def submit_quiz():
    user_id = int(get_jwt_identity())
    data=request.get_json()
    answers=data.get('answers')
    if not answers:
        return jsonify({'message':'No answers provided'}),400
    cur=mysql.connection.cursor()
    score=0
    total=0
    for answer in answers:
        fid=answer["flashcard_id"]
        user_ans=answer["user_answer"]
        
        query='''
        SELECT f.id, f.answer
        FROM flashcards f
        JOIN topics t ON f.topic_id = t.id
        JOIN subjects s ON t.subject_id = s.id
        WHERE f.id = %s AND s.user_id = %s
    '''
        cur.execute(query,(fid,user_id))
        result=cur.fetchone()
        if not result:
            continue
        total+=1
        correct=result[1]
            
        cur.execute('''
                    update flashcards
                    set total_attempts=total_attempts+1
                    where id=%s''',(fid,))
        if user_ans.strip().lower()==correct.strip().lower():
            score+=1
            cur.execute('''
                    update flashcards
                    set correct_attempts=correct_attempts+1,
                    interval_days=interval_days+2,
                    last_reviewed=current_date
                    where id=%s''',(fid,))
        else:
            cur.execute('''
                        update flashcards
                        set 
                           interval_days=1,
                           last_reviewed=current_date
                        where id=%s''',(fid,))
        cur.execute('''
                    update flashcards
                    set
                        next_review_date=date_add(current_date,interval  interval_days day)
                    where id=%s''',(fid,))
        cur.execute('''
                    update flashcards
                    set retention_score=
                        case 
                            when total_attempts=0 then 0
                            else (correct_attempts*100.0)/total_attempts
                        end
                    where id=%s
                    ''',(fid,))
    mysql.connection.commit()
    cur.close()
    return jsonify({
            'score':score,
            'total':total
        }),200
        