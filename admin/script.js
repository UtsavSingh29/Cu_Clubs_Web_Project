// Initialize IndexedDB
let db;
const request = indexedDB.open("collegeEvents", 1);

request.onerror = function (event) {
    console.error("Database error:", event.target.errorCode);
};

request.onupgradeneeded = function (event) {
    db = event.target.result;
    const objectStore = db.createObjectStore("events", { keyPath: "id", autoIncrement: true });
    objectStore.createIndex("name", "name", { unique: false });
};

request.onsuccess = function (event) {
    db = event.target.result;
    displayEvents(); // Load events after the database has been initialized
};

// Image source toggle between file and URL
document.querySelectorAll('input[name="image-source"]').forEach((radio) => {
    radio.addEventListener("change", function () {
        const fileInput = document.getElementById("file-input");
        const urlInput = document.getElementById("url-input");

        if (this.value === "file") {
            fileInput.style.display = "block";
            urlInput.style.display = "none";
        } else if (this.value === "url") {
            fileInput.style.display = "none";
            urlInput.style.display = "block";
        }
    });
});

// Add event form submission
document.getElementById("add-event-form").addEventListener("submit", function (e) {
    e.preventDefault();

    const eventName = document.getElementById("event-name").value;
    const eventClub = document.getElementById("event-club").value;
    const eventDescription = document.getElementById("event-description").value;
    const selectedSource = document.querySelector('input[name="image-source"]:checked').value;

    if (selectedSource === "file") {
        const eventImage = document.getElementById("event-image").files;

        if (!eventImage || eventImage.length === 0) {
            alert("Please select an image file.");
            return;
        }

        const reader = new FileReader();
        reader.onloadend = function () {
            addEvent({
                name: eventName,
                club: eventClub,
                description: eventDescription,
                image: reader.result // File data as base64
            });
        };
        reader.readAsDataURL(eventImage[0]);

    } else if (selectedSource === "url") {
        const eventImageUrl = document.getElementById("event-image-url").value;

        if (!eventImageUrl || !isValidUrl(eventImageUrl)) {
            alert("Please enter a valid image URL.");
            return;
        }

        addEvent({
            name: eventName,
            club: eventClub,
            description: eventDescription,
            image: eventImageUrl // URL of the image
        });
    }

    this.reset(); // Reset form after submission
});

// Add event to IndexedDB
function addEvent(event) {
    if (!db) {
        console.error("Database not initialized.");
        return;
    }

    const transaction = db.transaction(["events"], "readwrite");
    const objectStore = transaction.objectStore("events");

    const request = objectStore.add(event);

    request.onsuccess = function () {
        console.log("Event added successfully!");
        displayEvents(); // Refresh displayed events
    };

    request.onerror = function (event) {
        console.error("Error adding event:", event.target.errorCode);
    };
}

// Display events in card format
function displayEvents() {
    const cardsContainer = document.getElementById("cards-container");
    cardsContainer.innerHTML = "";

    if (!db) {
        console.error("Database not initialized.");
        return;
    }

    const transaction = db.transaction(["events"], "readonly");
    const objectStore = transaction.objectStore("events");

    objectStore.openCursor().onsuccess = function (event) {
        const cursor = event.target.result;

        if (cursor) {
            const card = document.createElement("div");
            card.classList.add("card");

            card.innerHTML = `
                <img src="${cursor.value.image}" alt="${cursor.value.name}" class="card-image">
                <div class="card-body">
                    <h3>${cursor.value.name}</h3>
                    <p><strong>Club:</strong> ${cursor.value.club}</p>
                    <p>${cursor.value.description}</p>
                </div>
                <div class="card-actions">
                    <button class="publish" onclick="publishEvent(${cursor.value.id})">Publish</button>
                </div>
            `;

            cardsContainer.appendChild(card);
            cursor.continue();
        } else {
            console.log("No more events found.");
        }
    };
}

// Publish event function
function publishEvent(id) {
    const transaction = db.transaction(["events"], "readonly");
    const objectStore = transaction.objectStore("events");

    const request = objectStore.get(id);

    request.onsuccess = function () {
        const event = request.result;

        if (event) {
            // Save event as published (could also include additional logic if needed)
            const publishedEvents = JSON.parse(localStorage.getItem("publishedEvents")) || [];
            publishedEvents.push(event);
            localStorage.setItem("publishedEvents", JSON.stringify(publishedEvents));

            // Remove event from the admin page
            deleteEvent(id);
        }
    };
}

// Delete event function
function deleteEvent(id) {
    const transaction = db.transaction(["events"], "readwrite");
    const objectStore = transaction.objectStore("events");

    const request = objectStore.delete(id);

    request.onsuccess = function () {
        console.log("Event deleted successfully!");
        displayEvents(); // Refresh events after delete
    };

    request.onerror = function (event) {
        console.error("Error deleting event:", event.target.errorCode);
    };
}

// Validate URL
function isValidUrl(url) {
    try {
        new URL(url);
        return true;
    } catch (_) {
        return false;
    }
}
