document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("add-event-form");
  const adminCardsContainer = document.getElementById("admin-cards-container");

  let db;

  // Initialize IndexedDB for ACM events
  const request = indexedDB.open("adminEventsDB", 1);

  request.onsuccess = (e) => {
    db = e.target.result;
    loadAcmEvents();
  };

  request.onerror = (e) => {
    console.error("Error opening database:", e);
  };

  // Form submission for adding ACM events
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const eventName = document.getElementById("event-name").value;
    const eventClub = document.getElementById("event-club").value;
    const eventDescription = document.getElementById("event-description").value;
    const imageMethod = document.getElementById("event-image-method").value;
    let eventImage;

    if (imageMethod === "file") {
      const fileInput = document.getElementById("event-image-file");
      const reader = new FileReader();
      const file = fileInput.files[0];

      reader.onloadend = function () {
        eventImage = reader.result; // Base64 encoding of the image
        addAcmEvent({ eventName, eventClub, eventDescription, eventImage, published: false });
      };
      reader.readAsDataURL(file);
    } else if (imageMethod === "url") {
      eventImage = document.getElementById("event-image-url").value;
      if (eventImage.trim() === "") {
        alert("Please enter a valid image URL");
        return;
      }
      addAcmEvent({ eventName, eventClub, eventDescription, eventImage, published: false });
    }
  });

  // Add ACM event to IndexedDB
  function addAcmEvent(event) {
    const transaction = db.transaction(["acmEvents"], "readwrite");
    const store = transaction.objectStore("acmEvents");
    store.add(event);

    transaction.oncomplete = () => {
      loadAcmEvents();
      console.log("Event added successfully");
    };

    transaction.onerror = () => {
      console.log("Error adding event");
    };
  }

  // Load only ACM events on ACM page
  function loadAcmEvents() {
    adminCardsContainer.innerHTML = ""; // Clear container
    const transaction = db.transaction(["acmEvents"], "readonly");
    const store = transaction.objectStore("acmEvents");

    store.openCursor().onsuccess = (e) => {
      const cursor = e.target.result;
      if (cursor) {
        const event = cursor.value;
        displayAcmCard(event);
        cursor.continue();
      }
    };
  }

  // Display ACM event card with delete and publish functionality
  function displayAcmCard(event) {
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
        <button class="delete-event" data-id="${event.id}">Delete</button>
        <button class="publish-event" data-id="${event.id}" ${
      event.published ? "disabled" : ""
    }>${event.published ? "Published" : "Publish"}</button>
      </div>
    `;
    adminCardsContainer.appendChild(card);

    // Attach delete functionality to the delete button
    const deleteBtn = card.querySelector(".delete-event");
    deleteBtn.addEventListener("click", () => deleteAcmEvent(event.id));

    // Attach publish functionality to the publish button
    const publishBtn = card.querySelector(".publish-event");
    publishBtn.addEventListener("click", () => publishAcmEvent(event.id));
  }

  // Delete ACM event function
  function deleteAcmEvent(id) {
    const transaction = db.transaction(["acmEvents"], "readwrite");
    const store = transaction.objectStore("acmEvents");
    store.delete(id);

    transaction.oncomplete = () => {
      loadAcmEvents();
      console.log("ACM event deleted");
    };

    transaction.onerror = () => {
      console.log("Error deleting ACM event");
    };
  }

  // Publish ACM event function
  function publishAcmEvent(id) {
    const transaction = db.transaction(["acmEvents"], "readwrite");
    const store = transaction.objectStore("acmEvents");
    const request = store.get(id);

    request.onsuccess = () => {
      const event = request.result;
      event.published = true; // Update publish status
      store.put(event);

      transaction.oncomplete = () => {
        loadAcmEvents();
        saveToLocalStorage();
        console.log("ACM event published");
      };
    };
  }

  // Save ACM published events to localStorage (from both admin and acm)
  function saveToLocalStorage() {
    const transaction = db.transaction(["acmEvents"], "readonly");
    const store = transaction.objectStore("acmEvents");
    const events = [];

    store.openCursor().onsuccess = (e) => {
      const cursor = e.target.result;
      if (cursor) {
        const event = cursor.value;
        if (event.published) {
          events.push(event);
        }
        cursor.continue();
      } else {
        localStorage.setItem("acmEvents", JSON.stringify(events)); // Save ACM published events to localStorage
      }
    };
  }
});
