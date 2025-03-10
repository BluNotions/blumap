from django.db import models
from django.contrib.auth.models import User

class Conversation(models.Model):
    """
    A Conversation groups messages between two or more participants.
    For a simple 1-to-1 chat, typically two participants, 
    but can be extended to group chats if you wish.
    """
    participants = models.ManyToManyField(User, related_name='conversations')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        participant_names = ", ".join(p.username for p in self.participants.all())
        return f"Conversation among [{participant_names}]"

    class Meta:
        ordering = ['-created_at']  # Most recent conversations first

    def send_message(self, recipient_username, sender_username, text):
        # Find or create the conversation
        recipient = User.objects.get(username=recipient_username)
        sender = User.objects.get(username=sender_username)

        # Create the conversation if it doesn't exist
        self.participants.add(sender, recipient)

        # Create and save the message
        message = Message(conversation=self, sender=sender, text=text)
        message.save()
        return message

class Message(models.Model):
    """
    Each Message belongs to a specific Conversation.
    Instead of saving messages to localStorage, 
    we now store them in the DB using this model.
    """
    conversation = models.ForeignKey(
        Conversation,
        on_delete=models.CASCADE,
        related_name='messages'
    )
    sender = models.ForeignKey(
        User,
        on_delete=models.CASCADE, 
        related_name='sent_messages'
    )
    text = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
    
    # Optional: fields to track toxicity or blocked messages
    is_toxic = models.BooleanField(default=False)
    blocked_for_toxicity = models.BooleanField(default=False)

    def __str__(self):
        return f"Message from {self.sender.username} at {self.timestamp}"

    class Meta:
        ordering = ['timestamp']  # Messages ordered by time in ascending order