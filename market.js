document.addEventListener("DOMContentLoaded", function () {
    fetch('/get_market_products')
    .then(response => response.json())
    .then(products => {
        const marketGrid = document.querySelector(".market-grid");
        marketGrid.innerHTML = ""; // Clear old content

        products.forEach(product => {
            const productImage = product.image_url ? product.image_url : "images/default.jpg";

            const productHTML = `
                <div class="market-item" data-category="${product.category}">
                    <img src="${productImage}" alt="${product.product_name}">
                    <p>${product.product_name}</p>
                    <p>Price per kg: ₹${product.price}</p>
                    <input type="number" min="1" max="10" value="1" id="quantity-${product.product_id}" 
                        onchange="updatePrice('${product.product_id}', ${product.price})">
                    <p>Total Price: <span id="price-${product.product_id}">₹${product.price}</span></p>
                    <button onclick="addToCart('${product.product_id}', '${product.product_name}', ${product.price}, '${productImage}')">
                        Add to Cart
                    </button>
                </div>
            `;
            marketGrid.innerHTML += productHTML;
        });
    })
    .catch(error => console.error("Error fetching market data:", error));
});

// Function to update total price dynamically
function updatePrice(productId, price) {
    const quantity = document.getElementById(`quantity-${productId}`).value;
    const totalPriceElement = document.getElementById(`price-${productId}`);
    totalPriceElement.textContent = `₹${(quantity * price).toFixed(2)}`;
}

// Function to add product to local storage (NOT sending to database yet)
function addToCart(productId, productName, price, productImage) {
    const quantity = parseInt(document.getElementById(`quantity-${productId}`).value);
    const userEmail = localStorage.getItem("userEmail"); // Get logged-in user email

    if (!userEmail) {
        alert("You must be logged in to add items to the cart.");
        return;
    }

    let cart = JSON.parse(localStorage.getItem("cart")) || [];

    // Check if product already exists in cart
    let existingItem = cart.find(item => item.product_id === productId);
    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.push({
            product_id: productId,
            product_name: productName,
            quantity: quantity,
            price: price,
            image_url: productImage
        });
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    alert(`${productName} added to cart!`);
}

// Function to checkout (Now it sends cart data to the backend)
async function checkout() {
    const userEmail = localStorage.getItem("userEmail");
    const cartItems = JSON.parse(localStorage.getItem("cart")) || [];

    if (!userEmail) {
        alert("You must be logged in to checkout.");
        return;
    }

    if (cartItems.length === 0) {
        alert("Your cart is empty!");
        return;
    }

    try {
        const response = await fetch("/checkout_cart", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: userEmail, items: cartItems })
        });

        const result = await response.json();
        alert(result.message);
        localStorage.removeItem("cart");  // Clear cart after checkout
        window.location.href = "orders.html"; 
    } catch (error) {
        console.error("Error during checkout:", error);
        alert("Checkout failed. Please try again.");
    }
}
