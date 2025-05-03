from flask import Flask, request, jsonify
import mysql.connector
from flask_cors import CORS  # Import CORS module
from datetime import datetime

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)  # Allow all origins

# ✅ Database Connection
db = mysql.connector.connect(
    host="localhost",
    user="root",
    password="As231078As@23",
    database="FarmConnect"
)
cursor = db.cursor(dictionary=True)

@app.route("/", methods=["GET"])
def home():
    return "✅ Flask is running!"

# ✅ API to Save Transactions After Payment
@app.route("/save_transaction", methods=["POST", "OPTIONS"])  # Allow POST & OPTIONS (preflight request)
def save_transaction():
    if request.method == "OPTIONS":  # Handle CORS preflight request
        response = jsonify({"message": "CORS preflight check successful"})
        response.headers.add("Access-Control-Allow-Origin", "*")
        response.headers.add("Access-Control-Allow-Methods", "POST, OPTIONS")
        response.headers.add("Access-Control-Allow-Headers", "Content-Type, Authorization")
        return response, 200

    try:
        data = request.json
        transaction_id = data.get("transaction_id")
        total_amount = data.get("total_amount")
        delivery_address = data.get("delivery_address", "Not Provided")  
        status = data.get("status", "Completed")  
        date = data.get("date", datetime.now().strftime("%Y-%m-%d"))
        time = data.get("time", datetime.now().strftime("%H:%M:%S"))
        order_id = data.get("order_id")

        if not transaction_id or not total_amount or not order_id:
            return jsonify({"error": "Missing required transaction details!"}), 400

        # Insert transaction into database
        cursor.execute("""
            INSERT INTO transaction (transaction_id, total_amount, delivery_address, status, date, time, order_id)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
        """, (transaction_id, total_amount, delivery_address, status, date, time, order_id))

        db.commit()

        response = jsonify({"message": "Transaction saved successfully!", "transaction_id": transaction_id})
        response.headers.add("Access-Control-Allow-Origin", "*")  # Allow all origins
        return response, 200

    except mysql.connector.Error as db_error:
        db.rollback()
        return jsonify({"error": f"Database error: {db_error}"}), 500
    except Exception as e:
        return jsonify({"error": f"Internal server error: {str(e)}"}), 500

if __name__ == "__main__":
    print("✅ Flask is running on http://127.0.0.1:5000")
    app.run(debug=True, port=5000)
