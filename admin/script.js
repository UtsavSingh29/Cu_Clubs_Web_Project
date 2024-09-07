document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('add-event-form');
  const adminCardsContainer = document.getElementById('admin-cards-container');

  // Initialize IndexedDB
  let db;
  const request = indexedDB.open('eventsDB', 1);
  
  request.onupgradeneeded = (e) => {
    db = e.target.result;
    db.createObjectStore('events', { keyPath: 'id', autoIncrement: true });
  };
  
  request.onsuccess = (e) => {
    db = e.target.result;
    loadAdminEvents();
  };
  
  request.onerror = (e) => {
    console.error('Error opening database:', e);
  };

  // Form submission for adding events
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const eventName = document.getElementById('event-name').value;
    const eventClub = document.getElementById('event-club').value;
    const eventDescription = document.getElementById('event-description').value;
    const imageMethod = document.getElementById('event-image-method').value;
    let eventImage;

    if (imageMethod === 'file') {
      const fileInput = document.getElementById('event-image-file');
      const reader = new FileReader();
      const file = fileInput.files[0];

      reader.onloadend = function () {
        eventImage = reader.result;
        addEvent({ eventName, eventClub, eventDescription, eventImage, published: false });
      };
      reader.readAsDataURL(file);
    } else if (imageMethod === 'url') {
      eventImage = document.getElementById('event-image-url').value;
      addEvent({ eventName, eventClub, eventDescription, eventImage, published: false });
    }
  });

  // Add event to IndexedDB
  function addEvent(event) {
    const transaction = db.transaction(['events'], 'readwrite');
    const store = transaction.objectStore('events');
    store.add(event);

    transaction.oncomplete = () => {
      loadAdminEvents();
      console.log('Event added successfully');
    };

    transaction.onerror = () => {
      console.log('Error adding event');
    };
  }

  // Load all events on admin page
  function loadAdminEvents() {
    adminCardsContainer.innerHTML = ''; // Clear container
    const transaction = db.transaction(['events'], 'readonly');
    const store = transaction.objectStore('events');

    store.openCursor().onsuccess = (e) => {
      const cursor = e.target.result;
      if (cursor) {
        const event = cursor.value;
        displayAdminCard(event);
        cursor.continue();
      }
    };
  }

  // Display event card in admin view with delete and publish buttons
  function displayAdminCard(event) {
    const card = document.createElement('div');
    card.classList.add('card');
    card.innerHTML = `
      <img src="${event.eventImage}" class="card-image" alt="Event Image" />
      <div class="card-body">
        <h3>${event.eventName}</h3>
        <p>${event.eventClub}</p>
        <p>${event.eventDescription}</p>
      </div>
      <div class="card-actions">
        <button class="delete-event" data-id="${event.id}">Delete</button>
        <button class="publish-event" data-id="${event.id}" ${event.published ? 'disabled' : ''}>
          ${event.published ? 'Published' : 'Publish'}
        </button>
      </div>
    `;
    adminCardsContainer.appendChild(card);

    // Attach delete functionality to the delete button
    const deleteBtn = card.querySelector('.delete-event');
    deleteBtn.addEventListener('click', () => deleteEvent(event.id));

    // Attach publish functionality to the publish button
    const publishBtn = card.querySelector('.publish-event');
    publishBtn.addEventListener('click', () => publishEvent(event.id));
  }

  // Delete event function
  function deleteEvent(id) {
    const transaction = db.transaction(['events'], 'readwrite');
    const store = transaction.objectStore('events');
    store.delete(id);

    transaction.oncomplete = () => {
      loadAdminEvents();
      loadHomepageEvents();
      console.log('Event deleted');
    };

    transaction.onerror = () => {
      console.log('Error deleting event');
    };
  }

  // Publish event function
  function publishEvent(id) {
    const transaction = db.transaction(['events'], 'readwrite');
    const store = transaction.objectStore('events');
    const request = store.get(id);

    request.onsuccess = () => {
      const event = request.result;
      event.published = true; // Update publish status
      store.put(event);

      transaction.oncomplete = () => {
        loadAdminEvents();
        loadHomepageEvents();
        console.log('Event published');
      };
    };
  }
});
