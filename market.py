from flask import Flask, render_template, jsonify, request
import mysql.connector

app = Flask(__name__)

# Database Connection
db = mysql.connector.connect(
    host="localhost",
    user="root",
    password="As231078As@23",
    database="FarmConnect"
)
cursor = db.cursor(dictionary=True)

# Fetch Market Products
@app.route('/get_market_products', methods=['GET'])
def get_market_products():
    query = "SELECT product_id, product_name, price, category, image_url FROM Market"
    cursor.execute(query)
    products = cursor.fetchall()
    return jsonify(products)

# Serve Market Page
@app.route('/market')
def market():
    return render_template('market.html')

# Add to Cart Route
@app.route('/add_to_cart', methods=['POST'])
def add_to_cart():
    data = request.json
    product_id = data.get('product_id')
    product_name = data.get('product_name')
    price = data.get('price')
    image_url = data.get('image', "images/default.jpg")  # Default if missing
    user_email = data.get('email')  
    quantity = data.get('quantity')

    # Fetch customer ID using email
    cursor.execute("SELECT customer_id FROM customer WHERE email = %s", (user_email,))
    customer = cursor.fetchone()

    if not customer:
        return jsonify({"error": "Customer not found"}), 404

    customer_id = customer['customer_id']

    # Check if product exists in Market table
    cursor.execute("SELECT * FROM Market WHERE product_id = %s", (product_id,))
    product = cursor.fetchone()

    if not product:
        return jsonify({"error": "Product not found"}), 404

    # Check if product is already in the cart
    cursor.execute("SELECT * FROM Cart WHERE product_id = %s AND customer_id = %s", (product_id, customer_id))
    existing_cart_item = cursor.fetchone()

    if existing_cart_item:
        new_quantity = existing_cart_item['quantity'] + quantity
        new_total_price = new_quantity * price
        cursor.execute("UPDATE Cart SET quantity = %s, total_price = %s WHERE product_id = %s AND customer_id = %s",
                       (new_quantity, new_total_price, product_id, customer_id))
    else:
        total_price = quantity * price
        cursor.execute("""
            INSERT INTO Cart (product_id, product_name, customer_id, quantity, price, total_price, image_url)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
        """, (product_id, product_name, customer_id, quantity, price, total_price, image_url))

    db.commit()
    return jsonify({"message": "Product added to cart successfully!"})

if __name__ == '__main__':
    app.run(debug=True)
