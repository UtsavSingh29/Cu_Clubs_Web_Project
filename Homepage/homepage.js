document.addEventListener('DOMContentLoaded', () => {
    const homepageEventsContainer = document.getElementById('homepage-events-container');

    // Load published events on homepage
    function loadHomepageEvents() {
        const events = JSON.parse(localStorage.getItem('events')) || [];
        const publishedEvents = events.filter(event => event.published);

        // Clear the container before adding new events
        homepageEventsContainer.innerHTML = '';

        publishedEvents.forEach(event => {
            const eventCard = document.createElement('div');
            eventCard.className = 'homepage-event-card';
            eventCard.innerHTML = `
                <h3>${event.name}</h3>
                <p><strong>Club:</strong> ${event.club}</p>
                <p><strong>Description:</strong> ${event.description}</p>
                ${event.image ? `<img src="${event.image}" alt="${event.name}" style="max-width: 100%;"/>` : ''}
            `;
            homepageEventsContainer.appendChild(eventCard);
        });
    }

    loadHomepageEvents();
});
