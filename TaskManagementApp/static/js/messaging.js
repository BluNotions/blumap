/**
 * Retrieve the value of a cookie by name.
 * @param {string} name - The name of the cookie.
 * @returns {string|null} The cookie value, or null if not found.
 */
const getCookie = (name) => {
    const cookieStr = document.cookie;
    if (!cookieStr) return null;

    const cookies = cookieStr.split(';').map(cookie => cookie.trim());
    for (const cookie of cookies) {
        if (cookie.startsWith(name + '=')) {
            return decodeURIComponent(cookie.substring(name.length + 1));
        }
    }
    return null;
};

/**
 * Display a toast notification.
 * @param {string} message - The message to display.
 * @param {string} [type='info'] - The type of toast (e.g., 'info', 'success', 'error').
 */
const showToast = (message, type = 'info') => {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `<div class="toast-body">${message}</div>`;
    document.body.appendChild(toast);
    
    setTimeout(() => { toast.remove(); }, 3000);
};

/**
 * Sends a help request by creating a conversation via AJAX.
 * @param {number} recipientId - The recipient's user ID.
 */
const sendHelpRequest = (recipientId) => {
    // Check if the logged-in user is set
    if (!window.loggedInUserId) {
        alert('Please log in to send a help request.');
        return;
    }

    if (!recipientId) {
        alert('No valid recipient information available.');
        return;
    }

    const payload = {
        sender_id: window.loggedInUserId,
        recipient_id: recipientId
    };

    fetch('/messaging/create_conversation/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCookie('csrftoken')
        },
        body: JSON.stringify(payload)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showToast('Help request sent successfully!', 'success');
            loadInbox();  // Refresh the inbox UI from the database.
        } else {
            alert('Error sending help request: ' + (data.error || 'Unknown error'));
        }
    })
    .catch(err => console.error('Error sending help request:', err));
};

/**
 * Loads the inbox content from the server and updates the UI.
 */
const loadInbox = () => {
    fetch('/messaging/inbox/')
        .then(response => response.text())
        .then(html => {
            const inboxElement = document.getElementById('inboxContent');
            if (inboxElement) {
                inboxElement.innerHTML = html;
            }
        })
        .catch(err => console.error('Error loading inbox:', err));
};

document.addEventListener('DOMContentLoaded', () => {
    // Set the logged-in user's ID.
    // In production, this value should be set dynamically by your server-side code.
    window.loggedInUserId = window.loggedInUserId || 1; // Example: 1
    // Optionally, set a username if needed.
    window.loggedInUsername = window.loggedInUsername || 'User1';

    // Attach event listeners to all "Help" buttons.
    // These buttons must have a data attribute 'data-recipient-id'
    const helpButtons = document.querySelectorAll('.popup-help');
    helpButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            // Retrieve the recipient's user ID from the data attribute.
            const recipientId = button.dataset.recipientId;
            if (!recipientId) {
                alert('No valid recipient information available.');
                return;
            }
            sendHelpRequest(Number(recipientId));
        });
    });

    // Optionally load the inbox on page load if the user is logged in.
    if (window.loggedInUserId) {
        loadInbox();
    }
});

// Function to load friends for the user
async function loadFriends() {
  user_id = JSON.parse(window.localStorage.getItem('user')).id
   
   // Fetch the list of friends from the backend
   fetch('/friend-request/friends/'+user_id+'/') // Adjust the endpoint as necessary
       .then(response => {
           if (!response.ok) {
               throw new Error('Network response was not ok');
           }
           return response.json();
       })
       .then(data => {
           console.log('check',data.friends); // Log the data to see its structure
           const friendsListContent = document.getElementById("friendsList");
           friendsListContent.innerHTML = ""; // Clear existing content
           
           // Access the friends array from the response
           const friends = data.friends; // Access the friends property
           
           if (Array.isArray(friends)) { // Check if friends is an array
               
               if (friends.length === 0) {
                   friendsListContent.innerHTML = "<p>No friends added yet.</p>"; // No friends case
               } else {
                   friends.forEach(friend => {
                       const listItem = document.createElement("button");
                       listItem.textContent = friend; // Adjust based on your data structure
                       listItem.addEventListener('click', async function() {
                           // Load conversation with the clicked friend
                           const conversationContent = document.getElementById('conversationContent');
                           conversationContent.innerHTML = ''; // Clear existing messages
                           const history = conversationHistories[friend] || [];
                           for (const msg of history) {
                               await addMessage(conversationContent, msg.sender, msg.text);
                           }
                           const conversationModal = new bootstrap.Modal(document.getElementById('conversationModal'));
                           document.getElementById('modalUserName').textContent = friend; // Set the modal user name
                           conversationModal.show(); // Show the modal
                       });
                       friendsListContent.appendChild(listItem);
                   });
               }
           } else {
               console.error('Expected an array but got:', friends);
               friendsListContent.innerHTML = "<p>Error: Unexpected data format.</p>";
           }
           
           document.getElementById("friendsListSidebar").classList.remove("d-none");
       })
       .catch(error => {
           console.error('Error fetching friends:', error);
       });
}

// Call loadFriends on page load
window.onload = function() {
  loadConversations();
  loadFriends();
};

