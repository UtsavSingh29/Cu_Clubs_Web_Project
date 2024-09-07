document.addEventListener("DOMContentLoaded", function () {
    displayPublishedEvents();
});

// Display published events in card format
function displayPublishedEvents() {
    const cardsContainer = document.getElementById("published-cards-container");
    cardsContainer.innerHTML = "";

    const publishedEvents = JSON.parse(localStorage.getItem("publishedEvents")) || [];

    publishedEvents.forEach(event => {
        const card = document.createElement("div");
        card.classList.add("card");

        card.innerHTML = `
            <img src="${event.image}" alt="${event.name}" class="card-image">
            <div class="card-body">
                <h3>${event.name}</h3>
                <p><strong>Club:</strong> ${event.club}</p>
                <p>${event.description}</p>
            </div>
        `;

        cardsContainer.appendChild(card);
    });
}
