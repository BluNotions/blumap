
window.onload = () => {
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
    console.log('ID: ' + profile.getId()); // Do not send to your backend! Use an ID token instead.
    console.log('Name: ' + profile.getName());
    console.log('Image URL: ' + profile.getImageUrl());
    console.log('Email: ' + profile.getEmail()); // This is null if the 'email' scope is not present.
    // Send this token to your backend for verification.
    window.localStorage.setItem('user', JSON.stringify(response));
                window.location.reload(); // Reload the webpage after successful login
  }


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
fetchCsrfToken();  // Call this on page load

// ================================================
// Authentication System
class AuthSystem {
    constructor() {
        this.currentUser = null;
    }

    async login(email, password) {
        // Show loading animation
        document.getElementById('loadingAnimation').style.display = 'block'; // Show loading animation
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
            alert(JSON.stringify(this.currentUser));
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
const authSystem = new AuthSystem();

// Log in with Google 
// 954332897984-6eccprh5acm455775mb2sb6fms70pr5n.apps.googleusercontent.com
const googleLoginBtn = document.getElementById("googleLoginBtn");


function onSignIn(googleUser) {
    var profile = googleUser.getBasicProfile();
    console.log('ID: ' + profile.getId()); // Do not send to your backend! Use an ID token instead.
    console.log('Name: ' + profile.getName());
    console.log('Image URL: ' + profile.getImageUrl());
    console.log('Email: ' + profile.getEmail()); // This is null if the 'email' scope is not present.
  }










if (googleLoginBtn) {
    googleLoginBtn.addEventListener("click", async function() {
        if (!web3auth) {
            console.error("❌ Web3Auth is not initialized yet.");
            alert("Web3Auth is not ready yet. Please try again in a moment.");
            return;
        }
        try {
            const provider = await web3auth.connect();
            console.log("✅ Web3Auth provider:", provider);
            authSystem.currentUser = "web3authUser";
            document.getElementById('auth-link').textContent = 'Log Out';
            document.getElementById('brandName').textContent = "Web3Auth User";
            document.getElementById('statusNav').classList.remove('d-none');
            bootstrap.Modal.getInstance(document.getElementById('authModal')).hide();
        } catch (error) {
            console.error("❌ Error logging in with Web3Auth:", error);
            alert("Login failed. Please try again.");
        }
    });
}
  // Event listener for user icon click
//   document.getElementById('userIcon').addEventListener('click', function() {
//     const dropdown = document.getElementById('userDropdown');
//     dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
// });

// // Event listener for logout link
// document.getElementById('logoutLink').addEventListener('click', function() {
//     authSystem.logout();
//     // Additional logout logic here
// });
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
               // window.localStorage.setItem('user', JSON.stringify(result.user));
            
               // document.getElementById('inboxBtn').href = `/messaging/inbox?id=${result.user}`;
               // document.getElementById('auth-link').textContent = 'Log Out';
               // document.getElementById('brandName').textContent = result.user.id;
                //document.getElementById('statusNav').classList.remove('d-none');
                //document.getElementById("userStars").textContent = "★".repeat(result.stars);
               // bootstrap.Modal.getInstance(document.getElementById('authModal')).hide();
              
                

              
            } else {
                alert(result.message);
            }
        });
    });
}

function getCsrfToken() {
    const name = 'csrftoken';
    const cookieValue = document.cookie
        .split('; ')
        .find(row => row.startsWith(name + '='))
        ?.split('=')[1];
    return cookieValue;
}

document.getElementById('logout-link').addEventListener('click', async function(e) {
    e.preventDefault();

    try {
        // if (authSystem.currentUser === "web3authUser") {
        //     if (web3auth) {
        //         await web3auth.logout();
        //         console.log("✅ Web3Auth Logged Out");
        //     }
        // }
        authSystem.logout();

        // Notify backend (Django) to clear server-side session
        const csrfToken = getCsrfToken(); // or store it from step 2
        await fetch('/api/logout/', {
            method: 'POST',
            credentials: 'include',
            headers: {
                'X-CSRFToken': csrfToken,
            }
        });
        window.location.reload();
       // document.getElementById('auth-link').textContent = 'Log In';
      //  document.getElementById('brandName').textContent = 'Blumaps';
       // document.getElementById('statusNav').classList.add('d-none');
    } catch (error) {
        console.error("❌ Error during logout:", error);
        alert("Logout failed. Please try again.");
    }
});
