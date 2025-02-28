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
        alert("Please log in to send a help request.");
        return;
    }
    if (!recipientId) {
        alert("No valid recipient information available.");
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
            showToast("Help request sent successfully!", 'success');
            loadInbox();  // Refresh the inbox UI from the database.
        } else {
            alert("Error sending help request: " + (data.error || "Unknown error"));
        }
    })
    .catch(err => console.error("Error sending help request:", err));
};

/**
 * Loads the inbox content from the server and updates the UI.
 */
const loadInbox = () => {
    fetch('/inbox/')
        .then(response => response.text())
        .then(html => {
            const inboxElement = document.getElementById('inboxContent');
            if (inboxElement) {
                inboxElement.innerHTML = html;
            }
        })
        .catch(err => console.error("Error loading inbox:", err));
};



    //   if (e.target.matches('.popup-help')) {
    //     alert('hit')


document.addEventListener('DOMContentLoaded', () => {
    // Set the logged-in user's ID.
    // In production, this value should be set dynamically by your server-side code.
    window.loggedInUserId = window.loggedInUserId || 1; // Example: 1
    // Optionally, set a username if needed.
    window.loggedInUsername = window.loggedInUsername || "User1";

    // Attach event listeners to all "Help" buttons.
    // These buttons must have a data attribute 'data-recipient-id'
    const helpButtons = document.querySelectorAll('.popup-help');
    helpButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            alert('hit')
            e.preventDefault();
            // Retrieve the recipient's user ID from the data attribute.
            const recipientId = button.dataset.recipientId;
            if (!recipientId) {
                alert("No valid recipient information available.");
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
