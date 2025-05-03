from flask import Flask, request, jsonify
from flask_cors import CORS
import mysql.connector
from datetime import datetime
import traceback

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "http://127.0.0.1:5500"}})  # Allow frontend origin

def get_db_connection():
    return mysql.connector.connect(
        host="localhost",
        user="root",
        password="As231078As@23",  # Update with your MySQL password
        database="farmconnect"
    )

def get_customer_id(cursor, email):
    cursor.execute("SELECT customer_id FROM customer WHERE email = %s", (email,))
    result = cursor.fetchone()
    print("🔍 Customer lookup result:", result)
    return result[0] if result else None

@app.route("/checkout", methods=["POST"])
def checkout():
    try:
        data = request.get_json()
        print("🔥 Incoming JSON data:", data)

        email = data.get("email")
        cart_items = data.get("cart", [])
        total_raw = data.get("total", 0)

        try:
            total_price = float(total_raw)
        except Exception as e:
            print("❌ Failed to parse total:", total_raw)
            traceback.print_exc()
            return jsonify({"error": "Invalid total amount", "details": str(e)}), 400

        order_time = datetime.now()

        db = get_db_connection()
        cursor = db.cursor()

        customer_id = get_customer_id(cursor, email)
        if not customer_id:
            cursor.close()
            db.close()
            return jsonify({"error": "Customer not found"}), 400

        for index, item in enumerate(cart_items):
            try:
                product_id = item.get("id") or index + 1
                product_name = item.get("name") or "Unnamed Product"
                quantity = float(item.get("quantity") or 1)
                price = float(item.get("price") or 1)
                subtotal = round(quantity * price, 2)

                print(f"✅ Inserting: {product_id}, {product_name}, {quantity}, {price}")

                cursor.execute("""
                    INSERT INTO cart (
                        product_id, product_name, quantity, price, total_price,
                        date_added, promotion_code, customer_id, booking_id
                    )
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
                """, (
                    product_id, product_name, quantity, price, subtotal,
                    order_time, None, customer_id, None
                ))
            except Exception as item_error:
                print("❌ Error inserting item:", item)
                traceback.print_exc()
                continue

        db.commit()
        cursor.close()
        db.close()

        return jsonify({"message": "Order placed successfully!"}), 200

    except Exception as e:
        print("❌ General checkout error:", str(e))
        traceback.print_exc()
        return jsonify({"error": "Checkout failed", "details": str(e)}), 500

@app.route("/orders", methods=["GET"])
def get_orders():
    try:
        email = request.args.get("email")

        db = get_db_connection()
        cursor = db.cursor(dictionary=True)

        customer_id = get_customer_id(cursor, email)
        if not customer_id:
            cursor.close()
            db.close()
            return jsonify({"error": "Customer not found"}), 400

        cursor.execute("""
            SELECT product_name, quantity, price, total_price, date_added
            FROM cart
            WHERE customer_id = %s
            ORDER BY date_added DESC
        """, (customer_id,))

        orders = cursor.fetchall()

        cursor.close()
        db.close()

        return jsonify(orders), 200

    except Exception as e:
        print("❌ Error in get_orders:", str(e))
        traceback.print_exc()
        return jsonify({"error": "Internal server error", "details": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True)
