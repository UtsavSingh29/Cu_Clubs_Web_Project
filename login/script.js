// Handle login form submission
document.getElementById('login-form').addEventListener('submit', function (e) {
    e.preventDefault();

    const email = document.getElementById('login-email').value;
    const club = document.getElementById('login-club').value;
    const password = document.getElementById('login-password').value;

    // Retrieve stored user data from localStorage
    const storedUser = JSON.parse(localStorage.getItem(email));

    // Check if user exists and credentials match
    if (storedUser && storedUser.password === password && storedUser.club === club) {
        // Redirect to the admin page based on club selection
        switch (club) {
            case 'Science Club':
                window.location.href = 'science-admin.html';
                break;
            case 'Art Club':
                window.location.href = 'art-admin.html';
                break;
            case 'Sports Club':
                window.location.href = 'sports-admin.html';
                break;
            case 'Drama Club':
                window.location.href = 'drama-admin.html';
                break;
            case 'Music Club':
                window.location.href = 'music-admin.html';
                break;
            case 'Tech Club':
                window.location.href = 'tech-admin.html';
                break;
            default:
                alert('Invalid club selected');
        }
    } else {
        alert('Login failed: Incorrect email, club, or password.');
    }
});

// Handle signup form submission
document.getElementById('signup-form').addEventListener('submit', function (e) {
    e.preventDefault();

    const email = document.getElementById('signup-email').value;
    const club = document.getElementById('signup-club').value;
    const password = document.getElementById('signup-password').value;

    // Check if the email is already registered
    if (localStorage.getItem(email)) {
        alert('This email is already registered.');
        return;
    }

    // Save the new user data to localStorage
    const userData = {
        email: email,
        club: club,
        password: password
    };
    localStorage.setItem(email, JSON.stringify(userData));

    alert('Signup successful! You can now log in.');
});
