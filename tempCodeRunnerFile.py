from flask import Flask, request, jsonify
import mysql.connector
from werkzeug.security import check_password_hash
from flask_cors import CORS

app = Flask(__name__)

# Enable CORS to allow frontend requests
CORS(app)

# MySQL Database Configuration
DB_HOST = "localhost"
DB_USER = "root"
DB_PASSWORD = "As231078As@23"
DB_NAME = "FarmConnect"

# Connect to MySQL database
def get_db_connection():
    return mysql.connector.connect(
        host=DB_HOST,
        user=DB_USER,
        password=DB_PASSWORD,
        database=DB_NAME
    )

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()

    # Extract email, password, and user type from the request
    email = data.get('email')
    password = data.get('password')
    user_type = data.get('userType')  # 'farmer' or 'customer'

    # Validate input
    if not email or not password or not user_type:
        return jsonify({"success": False, "message": "Email, password, and user type are required."}), 400

    try:
        # Connect to the database
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        # Fetch the user from the database
        cursor.execute("SELECT * FROM users WHERE email = %s", (email,))
        user = cursor.fetchone()

        # If user not found
        if not user:
            return jsonify({"success": False, "message": "User not found."}), 404

        # Verify the password
        if not check_password_hash(user['password'], password):
            return jsonify({"success": False, "message": "Incorrect password."}), 401

        # Check if user is a farmer or customer, and fetch respective ID
        if user_type == 'farmer':
            cursor.execute("SELECT * FROM farmer WHERE user_id = %s", (user['user_id'],))
            farmer = cursor.fetchone()
            if not farmer:
                # Create a farmer ID if it doesn't exist
                cursor.execute("INSERT INTO farmer (user_id, name, email) VALUES (%s, %s, %s)",
                               (user['user_id'], user['name'], user['email']))
                conn.commit()
                cursor.execute("SELECT * FROM farmer WHERE user_id = %s", (user['user_id'],))
                farmer = cursor.fetchone()
            return jsonify({"success": True, "message": "Login successful!", "user": farmer, "userType": "farmer"})

        elif user_type == 'customer':
            cursor.execute("SELECT * FROM customer WHERE user_id = %s", (user['user_id'],))
            customer = cursor.fetchone()
            if not customer:
                # Create a customer ID if it doesn't exist
                cursor.execute("INSERT INTO customer (user_id, name, email) VALUES (%s, %s, %s)",
                               (user['user_id'], user['name'], user['email']))
                conn.commit()
                cursor.execute("SELECT * FROM customer WHERE user_id = %s", (user['user_id'],))
                customer = cursor.fetchone()
            return jsonify({"success": True, "message": "Login successful!", "user": customer, "userType": "customer"})

        else:
            return jsonify({"success": False, "message": "Invalid user type."}), 400

    except mysql.connector.Error as err:
        return jsonify({"success": False, "message": str(err)}), 500

    finally:
        cursor.close()
        conn.close()

if __name__ == '__main__':
    app.run(debug=True, port=5002)
