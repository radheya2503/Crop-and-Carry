document.addEventListener("DOMContentLoaded", function () {
    const cartItemsContainer = document.getElementById("cartItems");
    const totalPriceElement = document.getElementById("totalPrice");
    const checkoutButton = document.querySelector(".checkout-button");

    const loggedInEmail = sessionStorage.getItem("email") || localStorage.getItem("userEmail");

    if (!loggedInEmail) {
        alert("You must be logged in to checkout.");
        checkoutButton.disabled = true;
        checkoutButton.style.opacity = "0.5";
        return;
    }

    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    updateCartUI();

    function updateCartUI() {
        cartItemsContainer.innerHTML = "";
        let total = 0;

        if (cart.length === 0) {
            cartItemsContainer.innerHTML = "<p>Your cart is empty.</p>";
            checkoutButton.disabled = true;
        } else {
            checkoutButton.disabled = false;
            cart.forEach((item, index) => {
                const cartItem = document.createElement("div");
                cartItem.classList.add("cart-item");

                cartItem.innerHTML = `
                    <img src="${item.image}" alt="${item.name}">
                    <div class="item-details">
                        <h3>${item.name}</h3>
                        <p>Price: ₹${item.price}/kg</p>
                        <div class="quantity-controls">
                            <button class="decrease-qty" data-index="${index}">-</button>
                            <input type="number" class="quantity-input" data-index="${index}" 
                                   value="${item.quantity}" min="0.25" step="0.25">
                            <button class="increase-qty" data-index="${index}">+</button>
                        </div>
                        <p>Subtotal: ₹${(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                    <button class="remove-button" data-index="${index}">Remove</button>
                `;
                cartItemsContainer.appendChild(cartItem);
                total += item.price * item.quantity;
            });
        }

        totalPriceElement.textContent = total.toFixed(2);
        attachEventListeners();
    }

    function attachEventListeners() {
        document.querySelectorAll(".remove-button").forEach(button => {
            button.onclick = () => {
                const index = parseInt(button.getAttribute("data-index"));
                cart.splice(index, 1);
                saveCart();
                updateCartUI();
            };
        });

        document.querySelectorAll(".increase-qty").forEach(button => {
            button.onclick = () => {
                const index = parseInt(button.getAttribute("data-index"));
                cart[index].quantity = (parseFloat(cart[index].quantity) + 0.25).toFixed(2);
                saveCart();
                updateCartUI();
            };
        });

        document.querySelectorAll(".decrease-qty").forEach(button => {
            button.onclick = () => {
                const index = parseInt(button.getAttribute("data-index"));
                let newQty = (parseFloat(cart[index].quantity) - 0.25).toFixed(2);
                if (newQty >= 0.25) {
                    cart[index].quantity = newQty;
                } else {
                    cart.splice(index, 1);
                }
                saveCart();
                updateCartUI();
            };
        });

        document.querySelectorAll(".quantity-input").forEach(input => {
            input.onchange = () => {
                const index = parseInt(input.getAttribute("data-index"));
                let newQty = parseFloat(input.value);
                if (isNaN(newQty) || newQty < 0.25) newQty = 0.25;
                cart[index].quantity = newQty.toFixed(2);
                saveCart();
                updateCartUI();
            };
        });
    }

    function saveCart() {
        localStorage.setItem("cart", JSON.stringify(cart));
    }

    checkoutButton.onclick = () => {
        if (cart.length === 0) return;

        const order = {
            email: loggedInEmail,
            cart: cart.map((item, index) => ({
                id: item.id || index + 1, // fallback if no ID
                name: item.name,
                quantity: item.quantity,
                price: item.price,
                image: item.image
            })),
            total: parseFloat(totalPriceElement.textContent) || 0
        };

        console.log("📦 Sending order:", order);

        fetch("http://127.0.0.1:5000/checkout", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(order)
        })
        .then(response => {
            if (!response.ok) throw new Error("Order failed");
            return response.json();
        })
        .then(data => {
            alert("✅ Order placed successfully!");
            // ✅ Don't clear localStorage
            window.location.href = "orders.html";
        })
        .catch((error) => {
            console.error("🚨 Error submitting order:", error);
            alert("❌ Order submission failed. Check backend.");
        });
    };
});
