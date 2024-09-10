document.addEventListener("DOMContentLoaded", () => {
  const adminCardsContainer = document.getElementById("admin-cards-container");
  const adminListContainer = document.getElementById("admin-list-container");
  const eventForm = document.getElementById("add-event-form");
  const eventImageMethod = document.getElementById("event-image-method");
  const fileInput = document.getElementById("event-image-file");
  const urlInput = document.getElementById("event-image-url");
  const fileLabel = document.getElementById("file-label");
  const urlLabel = document.getElementById("url-label");

  // Load events and admins on page load
  function loadAdminData() {
    const events = JSON.parse(localStorage.getItem("events")) || [];
    const users = JSON.parse(localStorage.getItem("users")) || [];

    // Display all events
    adminCardsContainer.innerHTML = "";
    events.forEach((event) => {
      const eventCard = document.createElement("div");
      eventCard.className = "admin-card";
      eventCard.innerHTML = `
                <h3>${event.name}</h3>
                <p><strong>Club:</strong> ${event.club}</p>
                <p><strong>Description:</strong> ${event.description}</p>
                ${
                  event.image
                    ? `<img src="${event.image}" alt="${event.name}" style="max-width: 100%;"/>`
                    : ""
                }
                <div class="admin-card-buttons">
                    ${
                      event.published
                        ? `<button class="posted-btn" disabled>Posted</button>`
                        : `<button class="publish-btn">Post</button>`
                    }
                    <button class="delete-btn">Delete</button>
                </div>
            `;
      adminCardsContainer.appendChild(eventCard);
    });

    // Display list of admins
    adminListContainer.innerHTML = "";
    users.forEach((user) => {
      const adminEntry = document.createElement("div");
      adminEntry.className = "admin-entry";
      adminEntry.innerHTML = `
                <p><strong>Email:</strong> ${user.email}</p>
                <p><strong>Club:</strong> ${user.club}</p>
                <p><strong>Status:</strong> ${
                  user.approved ? "Approved" : "Pending"
                }</p>
                <button class="approve-btn" data-email="${user.email}" ${
        user.approved ? "disabled" : ""
      }>Approve</button>
                <button class="delete-btn" data-email="${
                  user.email
                }">Delete</button>
            `;
      adminListContainer.appendChild(adminEntry);
    });

    // Attach event listeners to the new buttons
    attachEventListeners();
  }

  // Attach event listeners to newly created buttons
  function attachEventListeners() {
    const publishButtons = document.querySelectorAll(".publish-btn");
    const deleteButtons = document.querySelectorAll(".delete-btn");

    publishButtons.forEach((button) => {
      button.addEventListener("click", handlePublish);
    });

    deleteButtons.forEach((button) => {
      button.addEventListener("click", handleDelete);
    });
  }

  function handlePublish(event) {
    const card = event.target.closest(".admin-card");
    const eventName = card.querySelector("h3").innerText;

    let events = JSON.parse(localStorage.getItem("events")) || [];
    events = events.map((event) => {
      if (event.name === eventName) {
        event.published = true; // Mark event as published
      }
      return event;
    });
    localStorage.setItem("events", JSON.stringify(events));

    loadAdminData();
    updateHomepage();
  }

  function handleDelete(event) {
    const card = event.target.closest(".admin-card");
    const eventName = card.querySelector("h3").innerText;

    let events = JSON.parse(localStorage.getItem("events")) || [];
    events = events.filter((event) => event.name !== eventName);
    localStorage.setItem("events", JSON.stringify(events));

    loadAdminData();
  }

  function updateHomepage() {
    const publishedEvents =
      JSON.parse(localStorage.getItem("events"))?.filter(
        (event) => event.published
      ) || [];
    const homepageEventsContainer = document.getElementById(
      "homepage-events-container"
    );

    // Make sure to clear the container first
    homepageEventsContainer.innerHTML = "";

    publishedEvents.forEach((event) => {
      const eventCard = document.createElement("div");
      eventCard.className = "homepage-event-card";
      eventCard.innerHTML = `
                <h3>${event.name}</h3>
                <p><strong>Club:</strong> ${event.club}</p>
                <p><strong>Description:</strong> ${event.description}</p>
                ${
                  event.image
                    ? `<img src="${event.image}" alt="${event.name}" style="max-width: 100%;"/>`
                    : ""
                }
            `;
      homepageEventsContainer.appendChild(eventCard);
    });
  }

  eventImageMethod.addEventListener("change", () => {
    if (eventImageMethod.value === "file") {
      fileInput.style.display = "block";
      urlInput.style.display = "none";
      fileLabel.style.display = "block";
      urlLabel.style.display = "none";
    } else {
      fileInput.style.display = "none";
      urlInput.style.display = "block";
      fileLabel.style.display = "none";
      urlLabel.style.display = "block";
    }
  });

  eventForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const eventName = document.getElementById("event-name").value;
    const eventClub = document.getElementById("event-club").value;
    const eventDescription = document.getElementById("event-description").value;
    let eventImage = "";

    if (eventImageMethod.value === "file") {
      if (fileInput.files.length > 0) {
        const file = fileInput.files[0];
        const reader = new FileReader();

        reader.onloadend = function () {
          eventImage = reader.result;

          // Store event data in localStorage
          const events = JSON.parse(localStorage.getItem("events")) || [];
          events.push({
            name: eventName,
            club: eventClub,
            description: eventDescription,
            image: eventImage,
            published: false,
          });
          localStorage.setItem("events", JSON.stringify(events));

          loadAdminData();
          eventForm.reset();
          fileInput.style.display = "block";
          urlInput.style.display = "none";
        };
        reader.readAsDataURL(file); // Converts file to Base64
      }
    } else {
      eventImage = urlInput.value;

      // Store event data in localStorage
      const events = JSON.parse(localStorage.getItem("events")) || [];
      events.push({
        name: eventName,
        club: eventClub,
        description: eventDescription,
        image: eventImage,
        published: false,
      });
      localStorage.setItem("events", JSON.stringify(events));

      loadAdminData();
      eventForm.reset();
      fileInput.style.display = "block";
      urlInput.style.display = "none";
    }
  });

  adminListContainer.addEventListener("click", function (e) {
    if (e.target.classList.contains("approve-btn")) {
      const email = e.target.dataset.email;
      const users = JSON.parse(localStorage.getItem("users")) || [];
      users.forEach((user) => {
        if (user.email === email) {
          user.approved = true;
        }
      });
      localStorage.setItem("users", JSON.stringify(users));
      loadAdminData();
    }

    if (e.target.classList.contains("delete-btn")) {
      const email = e.target.dataset.email;
      const users = JSON.parse(localStorage.getItem("users")) || [];
      const filteredUsers = users.filter((user) => user.email !== email);
      localStorage.setItem("users", JSON.stringify(filteredUsers));
      loadAdminData();
    }
  });

  loadAdminData();
});
