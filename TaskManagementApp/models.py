from django.db import models
from django.utils import timezone
from django.contrib.auth.models import User


# Task Management Model
class taskDb(models.Model):
    task = models.CharField(max_length=100)
    priority = models.CharField(max_length=30, choices=[
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
    ], default='medium')
    completed = models.BooleanField(default=False)
    time_date = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f"{self.task} - {'Completed' if self.completed else 'Pending'}"

    class Meta:
        verbose_name = "Task"
        verbose_name_plural = "Tasks"


# User Profile Model
class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    first_name = models.CharField(max_length=50, blank=True, null=True)
    last_name = models.CharField(max_length=50, blank=True, null=True)
    phone_number = models.CharField(max_length=15, blank=True, null=True)
    verification_type = models.CharField(max_length=50, blank=True, null=True)

    points = models.IntegerField(default=0)
    stars = models.FloatField(default=0.0)
    is_ngo = models.BooleanField(default=False)
    authority = models.CharField(max_length=100, blank=True, null=True)
    reg_code = models.CharField(max_length=100, blank=True, null=True)

    def __str__(self):
        return f"{self.user} ({'NGO' if self.is_ngo else 'User'})"

    class Meta:
        verbose_name = "User Profile"
        verbose_name_plural = "User Profiles"


# Friend Request Model
class FriendRequest(models.Model):
    id = models.IntegerField(),
    sender = models.ForeignKey(User, related_name='sent_requests', on_delete=models.CASCADE)
    receiver = models.ForeignKey(User, related_name='received_requests', on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=10, choices=[
        ('pending', 'Pending'),
        ('accepted', 'Accepted'),
        ('rejected', 'Rejected'),
    ], default='pending')

    def __str__(self):
        return f"{self.sender.username} -> {self.receiver.username} ({self.status})"

class Friend(models.Model):
    user1 = models.ForeignKey(User, related_name='friends1', on_delete=models.CASCADE)
    user2 = models.ForeignKey(User, related_name='friends2', on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user1', 'user2')  # No duplicate friendships

    def __str__(self):
        return f"{self.user1.username} & {self.user2.username}"


# Location Interest Model
class LocationInterest(models.Model):
    latitude = models.FloatField()
    longitude = models.FloatField()
    interest = models.TextField()
    need = models.CharField(max_length=100)

    def __str__(self):
        return self.interest

    class Meta:
        verbose_name = "Location Interest"
        verbose_name_plural = "Location Interests"


# Blumaps Table (Possibly Deprecated or Legacy)
class BlumapsTable(models.Model):
    id_number = models.CharField(max_length=255)
    username = models.CharField(max_length=255)
    password = models.CharField(max_length=255)
    latitude = models.FloatField()
    longitude = models.FloatField()
    community_need = models.TextField(blank=True, null=True)
    commerce_need = models.TextField(blank=True, null=True)
    private_need = models.TextField(blank=True, null=True)

    class Meta:
        verbose_name = "Blumaps Entry"
        verbose_name_plural = "Blumaps Entries"


# Locations Model (Main Location Tracking Table)
class Locations(models.Model):
    name = models.CharField(max_length=255)
    email = models.EmailField(blank=True, null=True)
    phone_number = models.CharField(max_length=20, blank=True, null=True)
    latitude = models.FloatField()
    longitude = models.FloatField()
    geohash = models.CharField(max_length=12, blank=True, null=True)

    description = models.TextField()
    category = models.CharField(max_length=50, choices=[
        ('Community', 'Community'),
        ('Commerce', 'Commerce'),
        ('Private', 'Private'),
    ])
    status = models.CharField(max_length=50, default='Pending')
    priority = models.CharField(max_length=20, default='Medium', blank=True, null=True)

    tags = models.JSONField(blank=True, null=True)
    attachments = models.JSONField(blank=True, null=True)

    date_created = models.DateTimeField(auto_now_add=True)
    date_updated = models.DateTimeField(auto_now=True)
    resolved_date = models.DateTimeField(blank=True, null=True)

    created_by = models.CharField(max_length=255, blank=True, null=True)
    updated_by = models.CharField(max_length=255, blank=True, null=True)

    def __str__(self):
        return self.name

    class Meta:
        db_table = 'Locations'
        verbose_name = "Location"
        verbose_name_plural = "Locations"
