# TaskManagementApp/test_views.py
from django.test import TestCase
from django.urls import reverse
from django.contrib.auth import get_user_model
from .models import FriendRequest, Locations

User = get_user_model()

class ViewsTestCase(TestCase):

    def setUp(self):
        # Create a user for testing
        self.user = User.objects.create_user(username='testuser', password='testpass')

    def test_home_view(self):
        response = self.client.get(reverse('home'))
        self.assertEqual(response.status_code, 200)
        self.assertTemplateUsed(response, 'index.html')

    def test_signup_view(self):
        response = self.client.post(reverse('signup'), {
            'username': 'newuser',
            'password1': 'newpassword',
            'password2': 'newpassword',
        })
        self.assertEqual(response.status_code, 302)  # Expecting a redirect after successful signup
        self.assertTrue(User.objects.filter(username='newuser').exists())  # Check if user is created

    def test_login_view(self):
        self.client.login(username='testuser', password='testpass')
        response = self.client.post(reverse('login_view'), {
            'identifier': 'testuser',
            'password': 'testpass',
        })
        self.assertEqual(response.status_code, 200)
        self.assertJSONEqual(response.content, {'success': True})

    def test_send_friend_request(self):
        # Create another user to send a friend request to
        receiver = User.objects.create_user(username='receiver', password='receiverpass')
        self.client.login(username='testuser', password='testpass')
        
        response = self.client.post(reverse('send_friend_request'), {
            'sender_id': self.user.id,
            'email': receiver.email,
        })
        self.assertEqual(response.status_code, 200)
        self.assertJSONEqual(response.content, {'status': 'success', 'message': 'Friend request sent and email delivered'})

    def test_accept_friend_request(self):
        # Create a friend request
        receiver = User.objects.create_user(username='receiver', password='receiverpass')
        friend_request = FriendRequest.objects.create(sender=self.user, receiver=receiver)

        response = self.client.post(reverse('accept_friend_request', args=[friend_request.id]))
        self.assertEqual(response.status_code, 200)
        self.assertJSONEqual(response.content, {'status': 'success', 'message': f'You are now friends with {self.user.username}'})

    def test_get_location_interests(self):
        response = self.client.get(reverse('get_location_interests'))
        self.assertEqual(response.status_code, 200)
        self.assertJSONEqual(response.content, [])  # Assuming no interests are set initially

# Add more tests as needed for other views