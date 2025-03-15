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
    // Decode the JWT token
    const responsePayload = jwt_decode(response.credential);
    
    // Make request to our backend Google login endpoint
    fetch('/api/google-login/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCsrfToken()
        },
        body: JSON.stringify({ email: responsePayload.email })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Store the user data and reload
            window.localStorage.setItem('user', JSON.stringify(data.user));
            window.location.reload();
        } else {
            // Handle error - user might need to register first
            alert(data.message || 'Login failed. Please register if you haven\'t already.');
        }
    })
    .catch(error => {
        console.error('Error during Google login:', error);
        alert('Login failed. Please try again.');
    });
  }







/*================================================*/
// Authentication System
class AuthSystem {
    constructor() {
        this.currentUser = null;
    }

    async login(email, password) {
        // Show loading animation and disable login button
        const loadingAnimation = document.getElementById('loadingAnimation');
        const loginButton = document.querySelector('#loginForm button[type="submit"]');
        
        if (loadingAnimation) loadingAnimation.style.display = 'block';
        if (loginButton) loginButton.disabled = true;
    
        try {
            const response = await fetch('/api/login/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCsrfToken()
                },
                body: JSON.stringify({ identifier: email, password })
            });

            // Hide loading animation and re-enable button
            if (loadingAnimation) loadingAnimation.style.display = 'none';
            if (loginButton) loginButton.disabled = false;

            const data = await response.json();
            if (!response.ok) {
                return { success: false, message: data.message || 'Login failed' };
            }

            this.currentUser = data.user; // Assuming the server returns user info
            
            return { success: true, user: data.user, stars: data.stars, isNGO: data.isNGO };
        } catch (error) {
            // Hide loading animation
            if (loadingAnimation) loadingAnimation.style.display = 'none'; // Hide loading animation
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

if(JSON.parse(window.localStorage.getItem('user')) !== null){
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

}
