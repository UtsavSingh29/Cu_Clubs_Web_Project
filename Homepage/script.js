document.addEventListener('DOMContentLoaded', () => {
  const eventsContainer = document.getElementById('events-container');

  // Initialize IndexedDB
  let db;
  const request = indexedDB.open('eventsDB', 1);
  
  request.onsuccess = (e) => {
    db = e.target.result;
    loadHomepageEvents();
  };
  
  request.onerror = (e) => {
    console.error('Error opening database:', e);
  };

  // Load published events on homepage
  function loadHomepageEvents() {
    eventsContainer.innerHTML = ''; // Clear container
    const transaction = db.transaction(['events'], 'readonly');
    const store = transaction.objectStore('events');

    store.openCursor().onsuccess = (e) => {
      const cursor = e.target.result;
      if (cursor) {
        const event = cursor.value;

        if (event.published) {
          displayEventCard(event);
        }

        cursor.continue();
      }
    };
  }

  // Display event card on homepage
  function displayEventCard(event) {
    const card = document.createElement('div');
    card.classList.add('card');
    card.innerHTML = `
      <img src="${event.eventImage}" class="card-image" alt="Event Image" />
      <div class="card-body">
        <h3>${event.eventName}</h3>
        <p>${event.eventClub}</p>
        <p>${event.eventDescription}</p>
      </div>
    `;
    eventsContainer.appendChild(card);
  }
});
