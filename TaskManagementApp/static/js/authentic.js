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
        try {
            const response = await fetch('/api/login/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCsrfToken() // Function to get CSRF token
                },
                body: JSON.stringify({ identifier: email, password })
            });

            const data = await response.json();
            if (!response.ok) {
                return { success: false, message: data.message || 'Login failed' };
            }

            this.currentUser = data.user; // Assuming the server returns user info
            alert(JSON.stringify(this.currentUser));
            return { success: true, user: data.user, stars: data.stars, isNGO: data.isNGO };
        } catch (error) {
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

// Log in with Google using Web3Auth
const googleLoginBtn = document.getElementById("googleLoginBtn");
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

// Local Login Form
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const phoneOrEmail = document.getElementById('loginPhoneOrEmail').value;
        const password = document.getElementById('loginPassword').value;
        authSystem.login(phoneOrEmail, password).then(result => {
            alert(`Result: ${result.success}`);
            if (result.success) {
                window.localStorage.setItem('user', result.user);
                document.getElementById('inboxBtn').href = `/messaging/inbox?id=${result.user}`;
                document.getElementById('auth-link').textContent = 'Log Out';
                document.getElementById('brandName').textContent = result.user.id;
                document.getElementById('statusNav').classList.remove('d-none');
                document.getElementById("userStars").textContent = "★".repeat(result.stars);
                bootstrap.Modal.getInstance(document.getElementById('authModal')).hide();
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

document.getElementById('auth-link').addEventListener('click', async function(e) {
    e.preventDefault();

    try {
        if (authSystem.currentUser === "web3authUser") {
            if (web3auth) {
                await web3auth.logout();
                console.log("✅ Web3Auth Logged Out");
            }
        }
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

        document.getElementById('auth-link').textContent = 'Log In';
        document.getElementById('brandName').textContent = 'Blumaps';
        document.getElementById('statusNav').classList.add('d-none');
    } catch (error) {
        console.error("❌ Error during logout:", error);
        alert("Logout failed. Please try again.");
    }
});
