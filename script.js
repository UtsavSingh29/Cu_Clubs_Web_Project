document.addEventListener('DOMContentLoaded', () => {
  const homepageEventsContainer = document.getElementById('homepage-events-container');

  // Load published events on homepage
  function loadHomepageEvents() {
    const events = JSON.parse(localStorage.getItem('events')) || [];
     console.log("Loaded events from localStorage:", events); 
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
const inputs = document.querySelectorAll(".input");

function focusFunc() {
  let parent = this.parentNode;
  parent.classList.add("focus");
}

function blurFunc() {
  let parent = this.parentNode;
  if (this.value == "") {
    parent.classList.remove("focus");
  }
}

inputs.forEach((input) => {
  input.addEventListener("focus", focusFunc);
  input.addEventListener("blur", blurFunc);
});
document.getElementById('contact-form').addEventListener('submit', function(event) {
            event.preventDefault();  // Prevents the form from submitting normally
            alert("Your message has been sent!");
        });



document.addEventListener('DOMContentLoaded', () => {
        const hamburger = document.querySelector('.hamburger');
        const mobileMenu = document.querySelector('.mobile-menu');
        const menuLinks = document.querySelectorAll('.mobile-menu a');

        // Toggle the mobile menu when the hamburger icon is clicked
        hamburger.addEventListener('click', () => {
            mobileMenu.classList.toggle('active');
        });

        // Close the mobile menu when clicking outside of it
        document.addEventListener('click', (event) => {
            if (!hamburger.contains(event.target) && !mobileMenu.contains(event.target)) {
                mobileMenu.classList.remove('active');
            }
        });

        // Close the mobile menu when a menu item is clicked
        menuLinks.forEach(link => {
            link.addEventListener('click', () => {
                mobileMenu.classList.remove('active');
            });
        });
    });