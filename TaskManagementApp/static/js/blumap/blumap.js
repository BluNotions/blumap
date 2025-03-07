let getLocation = document.cookie.includes('cookiesAccepted=true');

document.addEventListener('DOMContentLoaded', () => {
  let sidebar = document.getElementById('sidebar');

    map = initializeMap();  // Make sure map is ready
    // Check if sidebar exists before setting up drag
    if (sidebar) {
        setupSidebarDrag();
    } else {
        console.error('Sidebar element not found.');
    }
    
    if (getLocation) {
        requestLocation();
    } else {
        document.getElementById('cookieConsentBanner').style.display = 'block';
    }
    
    const acceptCookies = document.getElementById('accept-cookies');
    acceptCookies.addEventListener('click', () => {
        document.cookie = 'cookiesAccepted=true; max-age=' + (60 * 60 * 24 * 365) + '; path=/';
        getLocation = true; // âœ… Sync the state
        document.getElementById('cookieConsentBanner').style.display = 'none';
        requestLocation();
    });
});

function setupSidebarDrag() {
    let isDragging = false, startX = 0;

    sidebar.addEventListener('mousedown', (e) => {
        isDragging = true;
        startX = e.clientX - sidebar.offsetLeft;
        document.addEventListener('mousemove', dragSidebar);
        document.addEventListener('mouseup', stopDragging);
    });

    function dragSidebar(e) {
        if (!isDragging) return;
        let newLeft = e.clientX - startX;
        sidebar.style.left = `${Math.min(Math.max(newLeft, 0), window.innerWidth - sidebar.offsetWidth)}px`;
    }

    function stopDragging() {
        isDragging = false;
        document.removeEventListener('mousemove', dragSidebar);
        document.removeEventListener('mouseup', stopDragging);
    }
}

function initializeMap() {
  mapboxgl.accessToken = 'pk.eyJ1IjoibW9ybmVncmVlbiIsImEiOiJjamJsNWJtc3oxbDl6MzFvYnpoeHNucHNkIn0.F8OjEDmrkseIRVMOt32Fcw';
      var map = new mapboxgl.Map({
          container: 'map',
          style: 'mapbox://styles/mornegreen/cm6kon7vb00l001saaltfal2i',
          center: [0, 20],
          zoom: 1
      });
    map.addControl(new mapboxgl.NavigationControl());
    map.addControl(new mapboxgl.GeolocateControl({ positionOptions: { enableHighAccuracy: true }, trackUserLocation: true }));
    return map;
}

function requestLocation() {
    if (getLocation && navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
            const userLocation = [position.coords.longitude, position.coords.latitude];
            positionMap(userLocation);
        }, (error) => {
            console.error('Error getting location:', error);
        });
    }
}

function positionMap(userLocation) {
    map.flyTo({
        center: userLocation,
        zoom: 15,
        speed: 1.8,
        curve: 1.42
    });
}




    // Example of marking a touchmove event listener as passive
    document.addEventListener('touchmove', function(event) {
      // Your touchmove handling code here
  }, { passive: true });

  // Improved marker and control functionality
  let canAddMarker = false;
  let markers = [];
  function placeMarker(location, category, title = "Unnamed", description = "No details provided.", email = "Not provided", phone) {
      const popupContent = `
          <strong style="color: black;">${title}</strong>
          <p style="color: black;">${description}</p>
          <div style="margin-top: 10px;">
              <button class="btn btn-primary btn-sm popup-help" data-recipient="${phone}" data-email="${email}" data-phone="${phone}">Help</button>
          </div>
      `;
      const marker = new mapboxgl.Marker().setLngLat(location).addTo(map);
      markers.push(marker);
      marker.getElement().dataset.category = category;
      const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(popupContent).setLngLat(location);
      marker.setPopup(popup);
      marker.getElement().addEventListener('click', () => {
          marker.togglePopup();
      });
  }
  function clearMarkers() {
    markers.forEach(marker => marker.remove());
    markers = [];
  }
  function showTapMessage(message, duration = 3000) {
    const tapMessage = document.getElementById('tapMessage');
    tapMessage.textContent = message;
    tapMessage.style.display = "block";
    setTimeout(() => { tapMessage.style.display = "none"; }, duration);
  }

  // Delegate click event on document to handle dynamic help buttons
  document.addEventListener('click', function(event) {
      if (event.target.classList.contains('popup-help')) {
          // Optionally retrieve data attributes:
          const recipient = event.target.getAttribute('data-recipient');
          const email = event.target.getAttribute('data-email');
          const phone = event.target.getAttribute('data-phone');
          // You can use these details if needed for further logic

          showModal();
      }
  });

  // // Close modal when user clicks the close icon
   closeModal.addEventListener('click', hideModal);

  // Hide modal when clicking outside the modal-content area
  window.addEventListener('click', function(event) {
      if (event.target === helpModal) {
          hideModal();
      }
  });

  // Handle "Send" button click using Fetch API
  document.getElementById('sendHelp').addEventListener('click', function() {
      const message = document.getElementById('helpMessage').value;
      fetch('/messaging/send_message/', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json'
          },
          body: JSON.stringify({ text: message })
      })
      .then(response => response.json())
      .then(data => {
          alert('Message sent successfully!');
          hideModal();
          window.location.href = 'messaging/inbox'; // Adjust the URL as needed
      })
      .catch(error => {
          alert('There was an error sending your message.');
      });
  });

  // Handle "Go to Inbox" button click
  document.getElementById('goInbox').addEventListener('click', function() {
      window.location.href = '/messaging/inbox'; // Adjust the URL as needed
  });

  document.querySelectorAll('.control-add').forEach(button => {
    button.addEventListener('click', function() {

if (!window.localStorage.getItem('user') && !JSON.parse(window.localStorage.getItem('user')).id) {
 
        new bootstrap.Modal(document.getElementById('authModal')).show();
        showTapMessage("Please log in to add a marker.", 3000);
        return;
      }
      const category = this.getAttribute('data-category');
      document.getElementById('category').value = category;
      canAddMarker = true;
      const tapMessage = document.getElementById('tapMessage');
      tapMessage.textContent = "Tap on the map to add a marker";
      tapMessage.style.display = "block";
      const messageTimeout = setTimeout(() => { tapMessage.style.display = "none"; }, 4000);
      map.once('click', function(event) {
    
if (!window.localStorage.getItem('user') && !JSON.parse(window.localStorage.getItem('user')).id) {
 
          new bootstrap.Modal(document.getElementById('authModal')).show();
          showTapMessage("Please log in to add a marker.", 3000);
          return;
        }
        if (canAddMarker) {
          const coordinates = event.lngLat;
          document.getElementById('latitude').value = coordinates.lat;
          document.getElementById('longitude').value = coordinates.lng;
          const category = document.getElementById('category').value;
          let verifiedDetails = "";
          const currentUser = JSON.parse(window.localStorage.getItem('user')); //authSystem.users[authSystem.currentUser];
          if (currentUser && currentUser.isNGO) {
            verifiedDetails = "Verified by " + currentUser.firstName + " " + currentUser.lastName;
          }
          placeMarker(
            coordinates,
            category,
            "New Need",
            "No details provided.",
            currentUser.email,
            "1234567890"
          );
          const offcanvasAddEl = document.getElementById('mobileAdd');
          const offcanvasViewEl = document.getElementById('mobileView');
          if (offcanvasAddEl && offcanvasAddEl.classList.contains('show')) {
            bootstrap.Offcanvas.getInstance(offcanvasAddEl).hide();
          }
          if (offcanvasViewEl && offcanvasViewEl.classList.contains('show')) {
            bootstrap.Offcanvas.getInstance(offcanvasViewEl).hide();
          }
          tapMessage.style.display = "none";
          clearTimeout(messageTimeout);
          new bootstrap.Modal(document.getElementById('dataModal')).show();
        }
      });
    });
  });
  document.querySelectorAll('.control-view').forEach(button => {
    button.addEventListener('click', function() {
      canAddMarker = false;
      const category = this.getAttribute('data-category');
      clearMarkers();
      fetch(`/get_existing_data/?category=${category}`)
        .then(response => response.json())
        .then(data => {
          console.log(data); // Log the data to see its structure
          data.filter(item => item.category === category).forEach(item => {
            const location = [item.longitude, item.latitude];
            placeMarker(location, item.category, item.name, item.description, item.email, item.phone);
          });
        })
        .catch(error => console.error('Error fetching data:', error));
      let offcanvasAddEl = document.getElementById('mobileAdd');
      let offcanvasViewEl = document.getElementById('mobileView');
      if (offcanvasAddEl && offcanvasAddEl.classList.contains('show')) {
        bootstrap.Offcanvas.getInstance(offcanvasAddEl).hide();
      }
      if (offcanvasViewEl && offcanvasViewEl.classList.contains('show')) {
        bootstrap.Offcanvas.getInstance(offcanvasViewEl).hide();
      }
    });
  });


  document.getElementById('locationForm').addEventListener('submit', async function(event) {
    event.preventDefault();
    const title = document.getElementById('title').value;
    const description = document.getElementById('description').value;
    const combinedText = title + " " + description;
    const toxicity = await checkToxicity(combinedText);
    console.log("Toxicity score:", toxicity);
    if (toxicity >= 0.7) {
      alert("Your submission contains inappropriate content. Please revise your text.");
      return;
    }
    const latitude = document.getElementById('latitude').value;
    const longitude = document.getElementById('longitude').value;
    const category = document.getElementById('category').value;
    const data = { title, latitude, longitude, description, category };
    fetch('/save_location/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken':getCsrfToken()
      },
      body: JSON.stringify(data)
    })
    .then(response => {
      if (!response.ok) throw new Error('Network response was not ok');
      return response.json();
    })
    .then(responseData => {
      console.log('Success:', responseData);
      placeMarker([longitude, latitude], category, title, description);
    })
    .catch(error => console.error('Error:', error));
    bootstrap.Modal.getInstance(document.getElementById('dataModal')).hide();
    this.reset();
  });