document.addEventListener("DOMContentLoaded", function () {
    const loginButton = document.getElementById("submit-login");
    const togglePassword = document.getElementById("togglePassword");

    // Toggle Password Visibility
    if (togglePassword) {
        togglePassword.addEventListener("click", function () {
            const passwordField = document.getElementById("password");
            if (passwordField.type === "password") {
                passwordField.type = "text";
                togglePassword.classList.remove("fa-eye");
                togglePassword.classList.add("fa-eye-slash");
            } else {
                passwordField.type = "password";
                togglePassword.classList.remove("fa-eye-slash");
                togglePassword.classList.add("fa-eye");
            }
        });
    }

    // Login Function
    if (loginButton) {
        loginButton.addEventListener("click", async function (event) {
            event.preventDefault();

            const email = document.getElementById("email").value.trim();
            const password = document.getElementById("password").value.trim();
            const userType = document.querySelector("input[name='userType']:checked")?.value;

            if (!email || !password || !userType) {
                alert("Please fill in all fields!");
                return;
            }

            try {
                const response = await fetch("http://localhost:5002/login", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ email, password, userType })
                });

                const result = await response.json();
                if (result.success) {
                    alert("Login Successful!");

                    // 🔐 Store data in sessionStorage
                    sessionStorage.setItem("email", result.email);
                    sessionStorage.setItem("name", result.name);
                    sessionStorage.setItem("user_id", result.user_id);
                    sessionStorage.setItem("userType", result.userType);

                    // 📦 Store email in localStorage so cart.js can access it
                    localStorage.setItem("userEmail", result.email);

                    // 🔁 Redirect based on user type
                    if (userType === "customer") {
                        window.location.href = "customer-services.html";
                    } else if (userType === "farmer") {
                        window.location.href = "farmerservices.html";
                    }
                } else {
                    alert(result.message || "Login failed!");
                }
            } catch (error) {
                console.error("Error during login:", error);
                alert("An error occurred. Please try again.");
            }
        });
    }
});
