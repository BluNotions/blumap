// Variable to track if location access is granted
let getLocation = document.cookie.indexOf('cookiesAccepted=true') === -1 ? false : true;

// Check if the cookie has already been accepted
if (document.cookie.indexOf('cookiesAccepted=true') === -1) {
    document.getElementById('cookieConsentBanner').style.display = 'block';
} else {
    document.getElementById('cookieConsentBanner').style.display = 'none';
    // Request location if cookies are accepted
    requestLocation();
}

// Handle the click event for the 'Accept' button
document.getElementById('accept-cookies').addEventListener('click', function() {
    // Set a cookie to remember the user's choice
    document.cookie = 'cookiesAccepted=true; max-age=' + 60 * 60 * 24 * 365 + '; path=/';
    
    // Hide the cookie consent banner
    document.getElementById('cookieConsentBanner').style.display = 'none';
    
    // Request location after accepting cookies
    requestLocation();
});

// Map Initialization and Functions
function initializeMap() {
    mapboxgl.accessToken = 'pk.eyJ1IjoibW9ybmVncmVlbiIsImEiOiJjamJsNWJtc3oxbDl6MzFvYnpoeHNucHNkIn0.F8OjEDmrkseIRVMOt32Fcw';
    var map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mornegreen/cm6kon7vb00l001saaltfal2i',
        center: [0, 20],
        zoom: 1
    });
    map.addControl(new mapboxgl.NavigationControl());
    map.addControl(new mapboxgl.GeolocateControl({
        positionOptions: { enableHighAccuracy: true },
        trackUserLocation: true
    }));
    return map;
}

function requestLocation() {
    if (getLocation) {
        navigator.geolocation.getCurrentPosition(
            function(position) {
                var userLocation = [position.coords.longitude, position.coords.latitude];
                positionMap(userLocation);
            },
            function(error) {
                console.error('Error getting location:', error);
            }
        );
    } else {
        console.log("Location access not granted.");
    }
}

function positionMap(userLocation) {
    map.flyTo({
        center: userLocation,
        zoom: 15,
        speed: 1.8,
        curve: 1.42,
        easing: function(t) { return t; }
    });
}

// Ensure geolocation is requested in response to user gesture
document.addEventListener('DOMContentLoaded', function() {
    // Request location permission on document load
    if (navigator.geolocation) {
        navigator.permissions.query({ name: 'geolocation' }).then(function(permissionStatus) {
            if (permissionStatus.state === 'granted') {
                getLocation = true; // User granted permission
                requestLocation(); // Call the function to get the location
            } else if (permissionStatus.state === 'prompt') {
                // Permission has not been granted yet, prompt the user
                navigator.geolocation.getCurrentPosition(
                    function(position) {
                        getLocation = true; // User granted permission
                        var userLocation = [position.coords.longitude, position.coords.latitude];
                        // Position the map using the user's location
                        map.flyTo({
                            center: userLocation,
                            zoom: 15,
                            speed: 1.8,
                            curve: 1.42,
                            easing: function(t) { return t; }
                        });
                    },
                    function(error) {
                        console.error('Error getting location:', error);
                    }
                );
            } else {
                // Permission has been denied
                alert('Please enable location access in your browser settings to use this feature.');
            }
        });
    } else {
        alert('Geolocation is not supported by your browser.');
    }

    // Example of marking a touchmove event listener as passive
    document.addEventListener('touchmove', function(event) {
        // Your touchmove handling code here
    }, { passive: true });

    // Improved marker and control functionality
    let canAddMarker = false;
    let markers = [];
    function placeMarker(location, category, title = "Unnamed", description = "No details provided.", email = "Not provided", phone) {
        const popupContent = 
            <strong style="color: black;">${title}</strong>
            <p style="color: black;">${description}</p>
            <div style="margin-top: 10px;">
                <button class="btn btn-primary btn-sm popup-help" data-recipient="${phone}" data-email="${email}" data-phone="${phone}">Help</button>
            </div>
        ;
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
        if (!authSystem.currentUser) {
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
          if (!authSystem.currentUser) {
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
            const currentUser = authSystem.users[authSystem.currentUser];
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
        fetch('/get_existing_data/')
          .then(response => response.json())
          .then(data => {
            console.log(data); // Log the data to see its structure
            data.filter(item => item.Category === category).forEach(item => {
              const location = [item.Longitude, item.Latitude];
              placeMarker(location, item.Category, item.Name, item.Description, item.Email, item.Phone);
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

    async function checkToxicity(text) {
      const apiKey = "AIzaSyAYwrzOaH6eIU63Wwz1TcBZodnjvYV0-_k";
      const url = https://commentanalyzer.googleapis.com/v1alpha1/comments:analyze?key=${apiKey};
      const requestBody = {
        comment: { text: text },
        languages: ["en"],
        requestedAttributes: { TOXICITY: {} }
      };
      try {
        const response = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestBody)
        });
        if (!response.ok) {
          console.error("Perspective API error:", response.statusText);
          return 0;
        }
        const data = await response.json();
        return data.attributeScores.TOXICITY.summaryScore.value;
      } catch (error) {
        console.error("Error calling Perspective API:", error);
        return 0;
      }
    }
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
      fetch('/save_location', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': getCookie('csrftoken')
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

    document.addEventListener('DOMContentLoaded', function() {
        function makeDraggable(el) {
            let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
            el.onmousedown = dragMouseDown;
            function dragMouseDown(e) {
              e.preventDefault();
              pos3 = e.clientX;
              pos4 = e.clientY;
              document.onmouseup = closeDragElement;
              document.onmousemove = elementDrag;
            }
            function elementDrag(e) {
              e.preventDefault();
              pos1 = pos3 - e.clientX;
              pos2 = pos4 - e.clientY;
              pos3 = e.clientX;
              pos4 = e.clientY;
              el.style.top = (el.offsetTop - pos2) + "px";
              el.style.left = (el.offsetLeft - pos1) + "px";
            }
            function closeDragElement() {
              document.onmouseup = null;
              document.onmousemove = null;
            }
          }

      const leftSidebar = document.querySelector('.sidebar.d-none.d-lg-block');
      if (leftSidebar) makeDraggable(leftSidebar);
      const dataScienceSidebar = document.getElementById("dataScienceSidebar");
      makeDraggable(dataScienceSidebar);
    });

    document.getElementById("dataScienceBtn").addEventListener("click", function () {
      const sidebar = document.getElementById("dataScienceSidebar");
      sidebar.classList.remove("d-none");
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          function (position) {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            fetch(/get_most_urgent_need/?lat=${lat}&lon=${lon})
              .then(response => response.json())
              .then(data => {
                if (data && data.need) {
                  document.getElementById("dataScienceContent").innerHTML = 
                    <strong>${data.need.title}</strong>
                    <p>${data.need.description}</p>
                    <p><strong>Category:</strong> ${data.need.category}</p>
                    <p><strong>Location:</strong> ${data.need.location}</p>
                  ;
                } else {
                  document.getElementById("dataScienceContent").innerHTML = "<p>No urgent needs found in your area.</p>";
                }
              })
              .catch(error => {
                console.error("Error fetching data:", error);
                document.getElementById("dataScienceContent").innerHTML = "<p>Unable to retrieve data.</p>";
              });
          },
          function (error) {
            console.error("Geolocation error:", error);
            document.getElementById("dataScienceContent").innerHTML = "<p>Could not get location.</p>";
          }
        );
      } else {
        document.getElementById("dataScienceContent").innerHTML = "<p>Geolocation is not supported by your browser.</p>";
      }
    });
    document.getElementById("closeDataScience").addEventListener("click", function () {
      document.getElementById("dataScienceSidebar").classList.add("d-none");
    });
});

// Initialize the map
var map = initializeMap();