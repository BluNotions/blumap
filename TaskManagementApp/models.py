from django.db import models
from django.utils import timezone
from django.contrib.auth.models import User
from django.db import models
# Create your models here.

class taskDb(models.Model):
    task = models.CharField(max_length=30)
    priority = models.CharField(max_length=30)
    completed = models.BooleanField(default=False)
    time_date = models.DateTimeField(default=timezone.now)


    def __str__(self) -> str:
        return "%s %s"%(self.task, self.completed)







class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    verification_type = models.CharField(max_length=50, blank=True, null=True)
    phone_number = models.CharField(max_length=15, blank=True, null=True)

    def __str__(self):
        return self.user.username


#add

class LocationInterest(models.Model):
    latitude = models.FloatField()
    longitude = models.FloatField()
    interest = models.TextField()

    def __str__(self):
        return self.interest

class BlumapsTable(models.Model):
    id_number = models.CharField(max_length=255)
    username = models.CharField(max_length=255)
    password = models.CharField(max_length=255)
    latitude = models.FloatField()
    longitude = models.FloatField()
    community_need = models.TextField(null=True, blank=True)
    commerce_need = models.TextField(null=True, blank=True)
    private_need = models.TextField(null=True, blank=True)

class Locations(models.Model):
    Name = models.CharField(max_length=255)
    Email = models.EmailField(blank=True, null=True)
    Phone_Number = models.CharField(max_length=20, blank=True, null=True)
    Latitude = models.FloatField()
    Longitude = models.FloatField()
    GeoHash = models.CharField(max_length=12, blank=True, null=True)
    Description = models.TextField()
    Category = models.CharField(max_length=50, choices=[
        ('Community', 'Community'),
        ('Commerce', 'Commerce'),
        ('Private', 'Private'),
    ])
    Status = models.CharField(max_length=50, default='Pending')
    Priority = models.CharField(max_length=20, default='Medium', blank=True, null=True)
    Tags = models.JSONField(blank=True, null=True)
    Attachments = models.JSONField(blank=True, null=True)
    Date_Created = models.DateTimeField(auto_now_add=True)
    Date_Updated = models.DateTimeField(auto_now=True)
    Resolved_Date = models.DateTimeField(blank=True, null=True)
    Created_By = models.CharField(max_length=255, blank=True, null=True)
    Updated_By = models.CharField(max_length=255, blank=True, null=True)

    def __str__(self):
        return self.Name

    class Meta:
        db_table = 'Locations'  # Ensure the table name matches


