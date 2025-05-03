from flask import Flask, request, jsonify
from flask_mysqldb import MySQL  # type: ignore
from flask_cors import CORS
from werkzeug.security import generate_password_hash
import random

app = Flask(__name__)
CORS(app)  # Enable CORS to allow frontend requests

# Database Configuration
app.config['MYSQL_HOST'] = 'localhost'
app.config['MYSQL_USER'] = 'root'
app.config['MYSQL_PASSWORD'] = 'As231078As@23'  # Replace with your actual MySQL password
app.config['MYSQL_DB'] = 'FarmConnect'
app.config['MYSQL_PORT'] = 3306  # Change this if MySQL runs on another port

mysql = MySQL(app)

def generate_user_id():
    """Generate a random user_id like 'user_id001' and ensure uniqueness."""
    while True:
        random_number = random.randint(100, 999)  # Generates a number between 100-999
        user_id = f"user_id{random_number}"

        # Check if user_id already exists
        cur = mysql.connection.cursor()
        cur.execute("SELECT user_id FROM users WHERE user_id = %s", (user_id,))
        existing = cur.fetchone()
        cur.close()

        if not existing:
            return user_id  # Return if it's unique

@app.route('/signup', methods=['POST'])
def signup():
    try:
        data = request.json
        name = data.get('name')
        dob = data.get('dob')
        email = data.get('email')
        password = data.get('password')

        if not all([name, dob, email, password]):
            return jsonify({'success': False, 'message': 'All fields are required'})

        # Convert DOB to Age
        from datetime import datetime
        birth_date = datetime.strptime(dob, '%Y-%m-%d')
        age = datetime.today().year - birth_date.year

        hashed_password = generate_password_hash(password)

        user_id = generate_user_id()

        cur = mysql.connection.cursor()
        cur.execute(
            "INSERT INTO users (user_id, name, email, password, age) VALUES (%s, %s, %s, %s, %s)", 
            (user_id, name, email, hashed_password, age)
        )
        mysql.connection.commit()
        cur.close()

        return jsonify({'success': True, 'message': 'Signup successful', 'user_id': user_id})
    
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)})

if __name__ == '__main__':
    app.run(debug=True, port=5002)
