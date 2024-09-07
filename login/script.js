document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    const showSignup = document.getElementById('show-signup');
    const showLogin = document.getElementById('show-login');
    const loginSection = document.getElementById('login-section');
    const signupSection = document.getElementById('signup-section');
    const adminCardsContainer = document.getElementById('admin-cards-container');
    const adminListContainer = document.getElementById('admin-list-container');
    const eventForm = document.getElementById('add-event-form');
    const eventImageMethod = document.getElementById('event-image-method');
    const fileInput = document.getElementById('event-image-file');
    const urlInput = document.getElementById('event-image-url');
    const fileLabel = document.getElementById('file-label');
    const urlLabel = document.getElementById('url-label');

    // Toggle between login and signup forms
    showSignup.addEventListener('click', () => {
        loginSection.classList.remove('active');
        signupSection.classList.add('active');
    });

    showLogin.addEventListener('click', () => {
        signupSection.classList.remove('active');
        loginSection.classList.add('active');
    });

    // Handle login form submission
    loginForm.addEventListener('submit', function (e) {
        e.preventDefault();

        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        const club = document.getElementById('login-club').value;

        const users = JSON.parse(localStorage.getItem('users')) || [];
        const user = users.find(u => u.email === email && u.password === password && u.club === club);

        if (user) {
            if (user.approved) {
                // Redirect to the appropriate club admin page
                window.location.href = `${club.replace(/\s+/g, '-').toLowerCase()}-admin.html`;
            } else {
                alert('Your request is pending approval. Please wait until it gets approved by an admin.');
            }
        } else {
            alert('Invalid login credentials.');
        }
    });

    // Handle signup form submission
    signupForm.addEventListener('submit', function (e) {
        e.preventDefault();

        const email = document.getElementById('signup-email').value;
        const password = document.getElementById('signup-password').value;
        const club = document.getElementById('signup-club').value;

        const users = JSON.parse(localStorage.getItem('users')) || [];
        const userExists = users.some(u => u.email === email);

        if (!userExists) {
            users.push({ email, password, club, approved: false });
            localStorage.setItem('users', JSON.stringify(users));
            alert('Signup successful. Your request has been sent for approval.');
            signupSection.classList.remove('active');
            loginSection.classList.add('active');

            // Send the signup request to admin page
            const adminRequests = JSON.parse(localStorage.getItem('adminRequests')) || [];
            adminRequests.push({ email, club, status: 'Pending' });
            localStorage.setItem('adminRequests', JSON.stringify(adminRequests));
            loadAdminData();
        } else {
            alert('Email is already registered.');
        }
    });

    // Load admin data
    function loadAdminData() {
        const events = JSON.parse(localStorage.getItem('events')) || [];
        const adminRequests = JSON.parse(localStorage.getItem('adminRequests')) || [];
        const users = JSON.parse(localStorage.getItem('users')) || [];
        
        // Display all events
        adminCardsContainer.innerHTML = '';
        events.forEach(event => {
            const eventCard = document.createElement('div');
            eventCard.className = 'admin-card';
            eventCard.innerHTML = `
                <h3>${event.name}</h3>
                <p><strong>Club:</strong> ${event.club}</p>
                <p><strong>Description:</strong> ${event.description}</p>
                ${event.image ? `<img src="${event.image}" alt="${event.name}" style="max-width: 100%;"/>` : ''}
            `;
            adminCardsContainer.appendChild(eventCard);
        });

        // Display list of admin requests
        adminListContainer.innerHTML = '';
        adminRequests.forEach(request => {
            const adminEntry = document.createElement('div');
            adminEntry.className = 'admin-entry';
            adminEntry.innerHTML = `
                <p><strong>Email:</strong> ${request.email}</p>
                <p><strong>Club:</strong> ${request.club}</p>
                <p><strong>Status:</strong> ${request.status}</p>
                <button class="approve-btn" data-email="${request.email}" ${request.status === 'Approved' ? 'disabled' : ''}>Approve</button>
                <button class="deny-btn" data-email="${request.email}">Deny</button>
            `;
            adminListContainer.appendChild(adminEntry);
        });
    }

    loadAdminData();

    eventImageMethod.addEventListener('change', () => {
        if (eventImageMethod.value === 'file') {
            fileInput.style.display = 'block';
            urlInput.style.display = 'none';
            fileLabel.style.display = 'block';
            urlLabel.style.display = 'none';
        } else {
            fileInput.style.display = 'none';
            urlInput.style.display = 'block';
            fileLabel.style.display = 'none';
            urlLabel.style.display = 'block';
        }
    });

    eventForm.addEventListener('submit', function (e) {
        e.preventDefault();

        const eventName = document.getElementById('event-name').value;
        const eventClub = document.getElementById('event-club').value;
        const eventDescription = document.getElementById('event-description').value;
        let eventImage = '';

        if (eventImageMethod.value === 'file') {
            if (fileInput.files.length > 0) {
                eventImage = URL.createObjectURL(fileInput.files[0]);
            }
        } else {
            eventImage = urlInput.value;
        }

        const events = JSON.parse(localStorage.getItem('events')) || [];
        events.push({ name: eventName, club: eventClub, description: eventDescription, image: eventImage });
        localStorage.setItem('events', JSON.stringify(events));

        loadAdminData();

        eventForm.reset();
        fileInput.style.display = 'block';
        urlInput.style.display = 'none';
    });

    adminListContainer.addEventListener('click', function (e) {
        if (e.target.classList.contains('approve-btn')) {
            const email = e.target.dataset.email;
            const adminRequests = JSON.parse(localStorage.getItem('adminRequests')) || [];
            const users = JSON.parse(localStorage.getItem('users')) || [];
            const request = adminRequests.find(req => req.email === email);
            if (request) {
                request.status = 'Approved';
                localStorage.setItem('adminRequests', JSON.stringify(adminRequests));
                const user = users.find(u => u.email === email);
                if (user) {
                    user.approved = true;
                    localStorage.setItem('users', JSON.stringify(users));
                }
                loadAdminData();
            }
        }

        if (e.target.classList.contains('deny-btn')) {
            const email = e.target.dataset.email;
            const adminRequests = JSON.parse(localStorage.getItem('adminRequests')) || [];
            const index = adminRequests.findIndex(req => req.email === email);
            if (index > -1) {
                adminRequests.splice(index, 1);
                localStorage.setItem('adminRequests', JSON.stringify(adminRequests));
                loadAdminData();
            }
        }
    });
});
