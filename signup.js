document.getElementById('signup-form').addEventListener('submit', function(event) {
    event.preventDefault(); // Prevents the default form submission behavior

    const name = document.getElementById('name').value;
    const dob = document.getElementById('dob').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    const data = {
        name: name,
        dob: dob,
        email: email,
        password: password
    };

    // Send the data to the Flask backend
    fetch('http://localhost:5002/signup', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(result => {
        if (result.success) {
            alert(result.message); // Success message
        } else {
            alert(result.message); // Error message
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('An error occurred. Please try again.');
    });
});
