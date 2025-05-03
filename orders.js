document.addEventListener("DOMContentLoaded", function () {
    const orderItemsContainer = document.getElementById('orderItems');
    const totalAmountElement = document.getElementById('totalAmount');
    const loggedInEmail = sessionStorage.getItem("email") || localStorage.getItem("userEmail");

    if (!loggedInEmail) {
        orderItemsContainer.innerHTML = "<p>Please log in to see your orders.</p>";
        return;
    }

    // Try to load from backend first
    fetch(`http://127.0.0.1:5000/orders?email=${encodeURIComponent(loggedInEmail)}`)
        .then(res => {
            if (!res.ok) {
                throw new Error("Backend failed");
            }
            return res.json();
        })
        .then(orders => {
            displayOrders(orders, false); // from backend
        })
        .catch(err => {
            console.error("🚨 Error fetching orders:", err.message);
            // Fallback: Load from localStorage
            const localCart = JSON.parse(localStorage.getItem("cart")) || [];
            if (localCart.length > 0) {
                const fallbackOrders = localCart.map(item => ({
                    product_name: item.name,
                    quantity: item.quantity,
                    price: item.price,
                    total_price: (item.price * item.quantity).toFixed(2),
                    date_added: "" // no date display for local fallback
                }));
                displayOrders(fallbackOrders, true); // from localStorage
            } else {
                orderItemsContainer.innerHTML = "<p>No orders found.</p>";
                totalAmountElement.textContent = "0.00";
            }
        });

    function displayOrders(orders, fromLocal) {
        orderItemsContainer.innerHTML = "";
        let totalAmount = 0;

        if (orders.length === 0) {
            orderItemsContainer.innerHTML = "<p>No orders placed yet.</p>";
            totalAmountElement.textContent = "0.00";
            return;
        }

        orders.forEach(order => {
            const orderItem = document.createElement('div');
            orderItem.className = 'order-item';

            orderItem.innerHTML = `
                <div class="item-info">
                    <h3>${order.product_name}</h3>
                    <p>₹${order.price}/kg × ${order.quantity}kg</p>
                </div>
                <span class="item-total">₹${parseFloat(order.total_price).toFixed(2)}</span>
            `;

            orderItemsContainer.appendChild(orderItem);
            totalAmount += parseFloat(order.total_price);
        });

        totalAmountElement.textContent = totalAmount.toFixed(2);
    }
});
