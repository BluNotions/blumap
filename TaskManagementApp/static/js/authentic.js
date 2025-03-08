async function fetchCsrfToken() {
    try {
        const response = await fetch('/api/csrf/', { credentials: 'include' });
        if (!response.ok) throw new Error('Failed to fetch CSRF token');
        const data = await response.json();
       // console.log('CSRF Token:', data.csrfToken);
       return data.csrfToken;
    } catch (error) {
        console.error('Error fetching CSRF token:', error);
    }
}


function getCsrfToken() {
    const name = 'csrftoken';
    const cookieValue = document.cookie
        .split('; ')
        .find(row => row.startsWith(name + '='))
        ?.split('=')[1];
    return cookieValue;
}


window.onload = () => {
    fetchCsrfToken(); 
    google.accounts.id.initialize({
        client_id: "954332897984-6eccprh5acm455775mb2sb6fms70pr5n.apps.googleusercontent.com",
        callback: handleCredentialResponse
    });

    document.getElementById("googleSignInBtn").onclick = () => {
      google.accounts.id.prompt();  // Triggers the One Tap or Sign-In prompt
    };
  };

  function handleCredentialResponse(response) {
    console.log("Encoded JWT ID token: " + response.credential);
    var profile = response.credential.getBasicProfile();
    console.log('ID: ' + profile.getId());
    console.log('Name: ' + profile.getName());
    console.log('Image URL: ' + profile.getImageUrl());
    console.log('Email: ' + profile.getEmail());
    window.localStorage.setItem('user', JSON.stringify(response));
                window.location.reload(); // Reload the webpage after successful login
  }







/*================================================*/
// Authentication System
class AuthSystem {
    constructor() {
        this.currentUser = null;
    }

    async login(email, password) {
        // Show loading animation
        document.getElementById('loadingAnimation').style.display = 'block'; // Show loading animation
         // Disable the button
    
    
        try {
            const response = await fetch('/api/login/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCsrfToken() // Function to get CSRF token
                },
                body: JSON.stringify({ identifier: email, password })
            });

            // Hide loading animation
            document.getElementById('loadingAnimation').style.display = 'none'; // Hide loading animation

            const data = await response.json();
            if (!response.ok) {
                return { success: false, message: data.message || 'Login failed' };
            }

            this.currentUser = data.user; // Assuming the server returns user info
            
            return { success: true, user: data.user, stars: data.stars, isNGO: data.isNGO };
        } catch (error) {
            // Hide loading animation
            document.getElementById('loadingAnimation').style.display = 'none'; // Hide loading animation
            console.error('Login error:', error);
            return { success: false, message: 'An error occurred during login' };
        }
    }

    async register(userData) {
        try {
            const response = await fetch('/api/register/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCsrfToken() // Function to get CSRF token
                },
                body: JSON.stringify(userData)
            });

            const data = await response.json();
            if (!response.ok) {
                return { success: false, message: data.message || 'Registration failed' };
            }

            return { success: true, user: data.user };
        } catch (error) {
            console.error('Registration error:', error);
            return { success: false, message: 'An error occurred during registration' };
        }
    }

    logout() {
        this.currentUser = null;
        // Optionally notify the backend to clear the session
    }

    getCurrentUser() {
        return this.currentUser;
    }
}
/*================================================*/

const authSystem = new AuthSystem();



// Local Login Form
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const phoneOrEmail = document.getElementById('loginPhoneOrEmail').value;
        const password = document.getElementById('loginPassword').value;
        authSystem.login(phoneOrEmail, password).then(result => {
            if (result.success) {
                window.localStorage.setItem('user', JSON.stringify(result.user));
                window.location.reload(); // Reload the webpage after successful login
            } else {
                alert(result.message);
            }
        });
    });
}


//Logout button
document.getElementById('logout-link').addEventListener('click', async function(e) {
    e.preventDefault();
    try {
        authSystem.logout();
        window.localStorage.removeItem('user');
        const csrfToken = getCsrfToken(); 
        await fetch('/api/logout/', {
            method: 'POST',
            credentials: 'include',
            headers: {
                'X-CSRFToken': csrfToken,
            }
        }).then( window.location.reload()).catch(()=>alert("Logout failed. Please try again."));
    
    } catch (error) {
        console.error("❌ Error during logout:", error);
        alert("Logout failed. Please try again.");
    }
});
