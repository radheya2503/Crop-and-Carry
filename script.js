// Get Started Button (Redirect to signup or dashboard page)
document.querySelector('.subscribe-btn').addEventListener('click', function () {
    window.location.href = 'signup.html'; // Redirect to signup page
});

// Login Button (Show login popup or redirect)
document.querySelector('.login-btn').addEventListener('click', function () {
    window.location.href = 'login.html'; // Redirect to the login page
});

// Get references to the elements
const googleLoginBtn = document.getElementById('google-login');
const emailLoginBtn = document.getElementById('email-login');
const emailForm = document.getElementById('email-form');
const otpForm = document.getElementById('otp-form');
const forgotPasswordLink = document.getElementById('forgot-password');
const submitLoginBtn = document.getElementById('submit-login');
const verifyOtpBtn = document.getElementById('verify-otp');
let currentEmail = "";

// Google Login simulation (you can integrate real Google login later)
googleLoginBtn.addEventListener('click', () => {
    alert("Google Login functionality will be implemented.");
});

// Show the email login form when clicking the email login button
emailLoginBtn.addEventListener('click', () => {
    emailForm.classList.remove('hidden');
    googleLoginBtn.classList.add('hidden');
    emailLoginBtn.classList.add('hidden');
});

// Handle Email & Password login submission
submitLoginBtn.addEventListener('click', () => {
    currentEmail = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    if (currentEmail && password) {
        sendOtpToEmail(currentEmail);
        emailForm.classList.add('hidden');
        otpForm.classList.remove('hidden');
    } else {
        alert("Please fill in both fields!");
    }
});

// Send OTP to email
async function sendOtpToEmail(email) {
    try {
        const response = await fetch('http://localhost:5002/send-email-otp', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email })
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();
        if (data.success) {
            alert("OTP has been sent to your email!");
        } else {
            alert("Error sending OTP: " + data.message);
        }
    } catch (error) {
        console.error("Error:", error);
        alert("Error sending OTP. Please try again.");
    }
}

// Verify the OTP
verifyOtpBtn.addEventListener('click', async () => {
    const otp = document.getElementById('otp').value;

    try {
        const response = await fetch('http://localhost:5002/verify-email-otp', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email: currentEmail, emailOTP: otp })
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();
        if (data.success) {
            alert("OTP Verified! You are now logged in.");
            otpForm.classList.add('hidden');
            window.location.href = 'dashboard.html';  // Redirect to the dashboard page
        } else {
            alert("Invalid OTP! Please try again.");
        }
    } catch (error) {
        console.error("Error:", error);
        alert("Error verifying OTP. Please try again.");
    }
});

// Forgot Password functionality
forgotPasswordLink.addEventListener('click', () => {
    alert("A password reset link has been sent to your email.");
    // Redirect to password reset page (this is just for demonstration)
    window.location.href = 'forgot-password.html';
});

// Select the "Get Started" button
const getStartedBtn = document.getElementById('get-started-btn');

// Add a click event listener to redirect to get-started.html
getStartedBtn.addEventListener('click', () => {
    window.location.href = 'get-started.html'; // Redirect to the new page
});

// Signup Logic
async function sendLoginLink(event) {
    event.preventDefault(); // Prevent actual form submission

    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;
    const password = document.getElementById('password').value;
    const emailOTP = document.getElementById('email-otp').value;
    const phoneOTP = document.getElementById('phone-otp').value;

    // Check if both OTPs are provided
    if (emailOTP && phoneOTP) {
        try {
            const response = await fetch('http://localhost:5002/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, email, phone, password, emailOTP, phoneOTP }),
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();
            if (data.success) {
                alert('Signup successful! A login link has been sent to ' + email);
                window.location.href = 'login.html'; // Redirect to login page after successful signup
            } else {
                alert('Error during signup: ' + data.message);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error during signup. Please try again.');
        }
    } else {
        alert('Please verify both Email and Phone OTP before proceeding.');
    }
}

// Attach the signup function to the form's submit event
document.getElementById('signup-form').addEventListener('submit', sendLoginLink);
