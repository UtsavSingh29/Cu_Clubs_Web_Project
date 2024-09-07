document.addEventListener('DOMContentLoaded', () => {
    const adminCardsContainer = document.getElementById('admin-cards-container');
    const adminListContainer = document.getElementById('admin-list-container');
    const eventForm = document.getElementById('add-event-form');
    const eventImageMethod = document.getElementById('event-image-method');
    const fileInput = document.getElementById('event-image-file');
    const urlInput = document.getElementById('event-image-url');
    const fileLabel = document.getElementById('file-label');
    const urlLabel = document.getElementById('url-label');

    // Load events and admins on page load
    function loadAdminData() {
        const events = JSON.parse(localStorage.getItem('events')) || [];
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

        // Display list of admins
        adminListContainer.innerHTML = '';
        users.forEach(user => {
            const adminEntry = document.createElement('div');
            adminEntry.className = 'admin-entry';
            adminEntry.innerHTML = `
                <p><strong>Email:</strong> ${user.email}</p>
                <p><strong>Club:</strong> ${user.club}</p>
                <p><strong>Status:</strong> ${user.approved ? 'Approved' : 'Pending'}</p>
                <button class="approve-btn" data-email="${user.email}" ${user.approved ? 'disabled' : ''}>Approve</button>
                <button class="delete-btn" data-email="${user.email}">Delete</button>
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
            const users = JSON.parse(localStorage.getItem('users')) || [];
            const user = users.find(user => user.email === email);
            if (user) {
                user.approved = true;
                localStorage.setItem('users', JSON.stringify(users));
                loadAdminData();
            }
        }

        if (e.target.classList.contains('delete-btn')) {
            const email = e.target.dataset.email;
            const users = JSON.parse(localStorage.getItem('users')) || [];
            const index = users.findIndex(user => user.email === email);
            if (index > -1) {
                users.splice(index, 1);
                localStorage.setItem('users', JSON.stringify(users));
                loadAdminData();
            }
        }
    });
});
