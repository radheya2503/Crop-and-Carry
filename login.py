from flask import Flask, request, jsonify
from flask_mysqldb import MySQL
from flask_cors import CORS
from werkzeug.security import check_password_hash

app = Flask(__name__)
CORS(app)

# Database Configuration
app.config["MYSQL_HOST"] = "localhost"
app.config["MYSQL_USER"] = "root"
app.config["MYSQL_PASSWORD"] = "As231078As@23"  # Update this if needed
app.config["MYSQL_DB"] = "FarmConnect"
app.config["MYSQL_PORT"] = 3306

mysql = MySQL(app)

@app.route("/login", methods=["POST"])
def login():
    try:
        data = request.json
        email = data.get("email")
        password = data.get("password")
        user_type = data.get("userType")  # "customer" or "farmer"

        if not email or not password or not user_type:
            return jsonify({"success": False, "message": "Missing credentials"}), 400

        cur = mysql.connection.cursor()
        cur.execute("SELECT user_id, name, email, password FROM users WHERE email = %s", (email,))
        user = cur.fetchone()

        if user:
            user_id, name, email, hashed_password = user

            if check_password_hash(hashed_password, password):
                # ✅ User authentication successful
                # Now, check if they exist in customer/farmer table
                if user_type == "customer":
                    cur.execute("SELECT customer_id FROM customer WHERE email = %s", (email,))
                    existing_customer = cur.fetchone()

                    if not existing_customer:
                        # 🔹 Insert new customer record
                        cur.execute("""
                            INSERT INTO customer (user_id, name, email, phone_number, address, wishlist, payment_method, 
                                                 delivery_address, loyalty_points, order_history, total_price) 
                            VALUES (%s, %s, %s, '', '', '', '', '', 0, '', 0)
                        """, (user_id, name, email))
                        mysql.connection.commit()

                elif user_type == "farmer":
                    cur.execute("SELECT farmer_id FROM farmer WHERE email = %s", (email,))
                    existing_farmer = cur.fetchone()

                    if not existing_farmer:
                        # 🔹 Insert new farmer record
                        cur.execute("""
                            INSERT INTO farmer (user_id, name, email, phone_number, address, aadhar_number, farm_location, 
                                                products_offered, ratings, equipment_available) 
                            VALUES (%s, %s, %s, '', '', '', '', '', 0, 0)
                        """, (user_id, name, email))
                        mysql.connection.commit()

                cur.close()

                return jsonify({
                    "success": True,
                    "message": "Login successful",
                    "user_id": user_id,
                    "name": name,
                    "email": email,
                    "userType": user_type
                })

            else:
                return jsonify({"success": False, "message": "Incorrect password"}), 401

        else:
            return jsonify({"success": False, "message": "User not found"}), 404

    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True, port=5002)
