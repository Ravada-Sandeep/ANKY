from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from db import mysql
import config 
from routes.subjects import add_subject,get_subjects,delete_subject
from routes.topics import add_topic, get_topics,delete_topic
from routes.flashcards import add_flashcard, get_flashcards,delete_flashcard
from routes.quiz import get_quiz, submit_quiz
from routes.auth import register, login
from routes.dashboard import dashboard_summary, due_flashcards

app=Flask(__name__)
CORS(app)

app.config['JWT_SECRET_KEY'] = 'some_key'
jwt = JWTManager(app)

app.config['MYSQL_HOST'] = config.MYSQL_HOST
app.config['MYSQL_USER'] = config.MYSQL_USER
app.config['MYSQL_PASSWORD'] = config.MYSQL_PASSWORD
app.config['MYSQL_DB'] = config.MYSQL_DB

mysql.init_app(app)

@app.route('/')
def home():
    return "ANKY backend running........"

app.add_url_rule('/subjects','add_subject',add_subject,methods=['POST'])
app.add_url_rule('/subjects/','get_subjects',get_subjects,methods=['GET'])
app.add_url_rule('/subjects/<int:subject_id>','delete_subject',delete_subject,methods=['DELETE'])

app.add_url_rule('/topics', 'add_topic', add_topic, methods=['POST'])
app.add_url_rule('/topics/<int:subject_id>', 'get_topics', get_topics, methods=['GET'])
app.add_url_rule('/topics/<int:topic_id>','delete_topic',delete_topic,methods=['DELETE'])

app.add_url_rule('/flashcards', 'add_flashcard', add_flashcard, methods=['POST'])
app.add_url_rule('/flashcards/<int:topic_id>', 'get_flashcards', get_flashcards, methods=['GET'])
app.add_url_rule('/flashcards/<int:flashcard_id>','delete_flashcard',delete_flashcard,methods=['DELETE'])


app.add_url_rule('/quiz/<int:topic_id>', 'get_quiz', get_quiz, methods=['GET'])
app.add_url_rule('/submit-quiz', 'submit_quiz', submit_quiz, methods=['POST'])


app.add_url_rule('/register', 'register', register, methods=['POST'])
app.add_url_rule('/login', 'login', login, methods=['POST'])

app.add_url_rule('/dashboard-summary','dashboard_summary',dashboard_summary,methods=['GET'])

app.add_url_rule('/due-flashcards','due_flashcards',due_flashcards,methods=['GET'])


if __name__=='__main__':
    app.run(debug=True)
    