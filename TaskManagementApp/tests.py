from django.test import TestCase, Client
from django.contrib.auth.models import User
from django.urls import reverse
from .models import FriendRequest, Friend

class FriendRequestTests(TestCase):

    def setUp(self):
        # Setup users for the test
        self.sender = User.objects.create_user(username='sender', password='pass123')
        self.receiver = User.objects.create_user(username='receiver', email='receiver@example.com', password='pass123')
        self.client = Client()

    def test_send_friend_request(self):
        """Test sending a friend request triggers email and creates the record"""

        payload = {
            'sender_id': self.sender.id,
            'email': self.receiver.email
        }

        response = self.client.post(
            reverse('send_friend_request'),
            data=payload,
            content_type='application/json'
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(FriendRequest.objects.count(), 1)

        friend_request = FriendRequest.objects.first()
        self.assertEqual(friend_request.sender, self.sender)
        self.assertEqual(friend_request.receiver, self.receiver)
        self.assertEqual(friend_request.status, 'pending')

    def test_accept_friend_request(self):
        """Test accepting a friend request"""

        friend_request = FriendRequest.objects.create(
            sender=self.sender,
            receiver=self.receiver,
            status='pending'
        )

        response = self.client.get(reverse('accept_friend_request', args=[friend_request.id]))

        self.assertEqual(response.status_code, 200)

        friend_request.refresh_from_db()
        self.assertEqual(friend_request.status, 'accepted')

        self.assertEqual(Friend.objects.count(), 2)

        friends = Friend.objects.filter(user1=self.sender) | Friend.objects.filter(user2=self.sender)
        self.assertEqual(friends.count(), 1)

    def test_reject_friend_request(self):
        """Test rejecting a friend request"""

        friend_request = FriendRequest.objects.create(
            sender=self.sender,
            receiver=self.receiver,
            status='pending'
        )

        response = self.client.get(reverse('reject_friend_request', args=[friend_request.id]))

        self.assertEqual(response.status_code, 200)

        friend_request.refresh_from_db()
        self.assertEqual(friend_request.status, 'rejected')

        self.assertEqual(Friend.objects.count(), 0)

    def test_cannot_accept_nonexistent_request(self):
        """Test 404 if accepting a non-existent request"""

        response = self.client.get(reverse('accept_friend_request', args=[999]))

        self.assertEqual(response.status_code, 404)

    def test_duplicate_friend_request(self):
        """Test sending duplicate friend request fails"""

        FriendRequest.objects.create(sender=self.sender, receiver=self.receiver, status='pending')

        payload = {
            'sender_id': self.sender.id,
            'email': self.receiver.email
        }

        response = self.client.post(
            reverse('send_friend_request'),
            data=payload,
            content_type='application/json'
        )

        self.assertEqual(response.status_code, 400)
        self.assertEqual(FriendRequest.objects.count(), 1)

    def test_list_friends(self):
        """Test listing friends of a user"""

        Friend.objects.create(user1=self.sender, user2=self.receiver)

        response = self.client.get(reverse('list_friends', args=[self.sender.id]))

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), {'friends': ['receiver']})
