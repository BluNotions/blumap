
  // Show Friends List sidebar when the navbar item is clicked
  document.addEventListener('DOMContentLoaded', function() {
    document.getElementById("friendsListBtn").addEventListener("click", function(e) {
        e.preventDefault();
        user_id = JSON.parse(window.localStorage.getItem('user')).id
        // Fetch the list of friends from the backend
        fetch('friend-request/friends/'+user_id+'/') // Adjust the endpoint as necessary
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                console.log('check',data.friends); // Log the data to see its structure
                const friendsListContent = document.getElementById("friendsListContent");
                friendsListContent.innerHTML = ""; // Clear existing content
                
                // Access the friends array from the response
                const friends = data.friends; // Access the friends property
                
                if (Array.isArray(friends)) { // Check if friends is an array
                    
                    if (friends.length === 0) {
                        friendsListContent.innerHTML = "<p>No friends added yet.</p>"; // No friends case
                    } else {
                        friends.forEach(friend => {
                            const listItem = document.createElement("span");
                            listItem.textContent = friend; // Adjust based on your data structure
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
    });

    // Hide Friends List sidebar
    document.getElementById("closeFriendsListSidebar").addEventListener("click", function() {
        document.getElementById("friendsListSidebar").classList.add("d-none");
    });
    
    // Show Add Friend sidebar when the navbar item is clicked
    document.getElementById("addFriendBtn").addEventListener("click", function(e) {
      e.preventDefault();
      document.getElementById("addFriendSidebar").classList.remove("d-none");
    });
    
    // Hide Add Friend sidebar
    document.getElementById("closeAddFriendSidebar").addEventListener("click", function() {
      document.getElementById("addFriendSidebar").classList.add("d-none");
    });
    
    // Handle the Add Friend action
    // document.getElementById("addFriendAction").addEventListener("click", function() {
    //   const username = document.getElementById("friendUsername").value.trim();
    //   if (username === "") {
    //     alert("Please enter a username");
    //     return;
    //   }
     // friend request logic
  //    
  
  document.getElementById("addFriendAction").addEventListener("click", function () {
    const email = document.getElementById("friendUsername").value; // Get the email input
    const username = document.getElementById("friendUsername").value; // Replace with actual username if necessary
    console.log(email);
// Later when you want to retrieve sender_id
const storedUser = JSON.parse(window.localStorage.getItem('user'));
const sender_id = storedUser.id;
    // AJAX call to check if the user exists
    fetch('/api/check_user/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ identifier: email }),
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        if (data.exists) {
            // Send email notification with friend request
            fetch('/friend-request/send/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  email: email,
                  sender_id: sender_id }),
            })
            .then(response => response.json())
            .then(data => {
                if (data.status === 'success') {
                    alert("Friend request sent to " + username);
                } else {
                    alert("Error: " + data.message);
                }
            });
        } else {
            alert("User does not exist.");
        }
    })
    .catch((error) => {
        console.error('Error:', error);
    });

    document.getElementById("friendUsername").value = "";
});
});
    
