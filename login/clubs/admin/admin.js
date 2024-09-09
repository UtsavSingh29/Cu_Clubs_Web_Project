document.addEventListener("DOMContentLoaded", () => {
  const adminCardsContainer = document.getElementById("admin-cards-container");
  const eventForm = document.getElementById("add-event-form");
  const eventImageMethod = document.getElementById("event-image-method");
  const fileInput = document.getElementById("event-image-file");
  const urlInput = document.getElementById("event-image-url");
  const fileLabel = document.getElementById("file-label");
  const urlLabel = document.getElementById("url-label");

  let db;

  // Initialize IndexedDB
  const request = indexedDB.open("adminEventsDB", 1);
  request.onupgradeneeded = (e) => {
    db = e.target.result;
    db.createObjectStore("adminEvents", { keyPath: "id", autoIncrement: true });
    db.createObjectStore("acmEvents", { keyPath: "id", autoIncrement: true });
  };

  request.onsuccess = (e) => {
    db = e.target.result;
    loadAdminData();
  };

  request.onerror = (e) => {
    console.error("Error opening database:", e);
  };

  // Load events (both admin and acm) on the admin page
  function loadAdminData() {
    adminCardsContainer.innerHTML = ""; // Clear container
    const transaction = db.transaction(["adminEvents", "acmEvents"], "readonly");

    const adminStore = transaction.objectStore("adminEvents");
    const acmStore = transaction.objectStore("acmEvents");

    // Load admin events
    adminStore.openCursor().onsuccess = (e) => {
      const cursor = e.target.result;
      if (cursor) {
        const event = cursor.value;
        displayAdminCard(event, "admin");
        cursor.continue();
      }
    };

    // Load acm events
    acmStore.openCursor().onsuccess = (e) => {
      const cursor = e.target.result;
      if (cursor) {
        const event = cursor.value;
        displayAdminCard(event, "acm");
        cursor.continue();
      }
    };
  }

  // Display event card in admin view with delete and publish buttons
  function displayAdminCard(event, source) {
    const card = document.createElement("div");
    card.classList.add("card");
    card.innerHTML = `
      <img src="${event.eventImage}" class="card-image" alt="Event Image" />
      <div class="card-body">
        <h3>${event.eventName}</h3>
        <p>${event.eventClub}</p>
        <p>${event.eventDescription}</p>
      </div>
      <div class="card-actions">
        <button class="delete-event" data-id="${event.id}" data-source="${source}">Delete</button>
        <button class="publish-event" data-id="${event.id}" data-source="${source}" ${
      event.published ? "disabled" : ""
    }>${event.published ? "Published" : "Publish"}</button>
      </div>
    `;
    adminCardsContainer.appendChild(card);

    // Attach delete functionality to the delete button
    const deleteBtn = card.querySelector(".delete-event");
    deleteBtn.addEventListener("click", () => deleteEvent(event.id, source));

    // Attach publish functionality to the publish button
    const publishBtn = card.querySelector(".publish-event");
    publishBtn.addEventListener("click", () => publishEvent(event.id, source));
  }

  // Delete event function
  function deleteEvent(id, source) {
    const transaction = db.transaction([`${source}Events`], "readwrite");
    const store = transaction.objectStore(`${source}Events`);
    store.delete(id);

    transaction.oncomplete = () => {
      loadAdminData();
      console.log("Event deleted");
    };

    transaction.onerror = () => {
      console.log("Error deleting event");
    };
  }

  // Publish event function
  function publishEvent(id, source) {
    const transaction = db.transaction([`${source}Events`], "readwrite");
    const store = transaction.objectStore(`${source}Events`);
    const request = store.get(id);

    request.onsuccess = () => {
      const event = request.result;
      event.published = true; // Update publish status
      store.put(event);

      transaction.oncomplete = () => {
        loadAdminData();
        saveToLocalStorage();
        console.log("Event published");
      };
    };
  }

  // Save published events to localStorage (from both admin and acm)
  function saveToLocalStorage() {
    const transaction = db.transaction(["adminEvents", "acmEvents"], "readonly");
    const adminStore = transaction.objectStore("adminEvents");
    const acmStore = transaction.objectStore("acmEvents");
    const events = [];

    adminStore.openCursor().onsuccess = (e) => {
      const cursor = e.target.result;
      if (cursor) {
        const event = cursor.value;
        if (event.published) {
          events.push(event);
        }
        cursor.continue();
      }
    };

    acmStore.openCursor().onsuccess = (e) => {
      const cursor = e.target.result;
      if (cursor) {
        const event = cursor.value;
        if (event.published) {
          events.push(event);
        }
        cursor.continue();
      } else {
        localStorage.setItem("events", JSON.stringify(events)); // Save published events to localStorage
      }
    };
  }
});
