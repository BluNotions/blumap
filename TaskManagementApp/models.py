from django.db import models
from django.utils import timezone

# Create your models here.

class taskDb(models.Model):
    task = models.CharField(max_length=30)
    priority = models.CharField(max_length=30)
    completed = models.BooleanField(default=False)
    time_date = models.DateTimeField(default=timezone.now)

    
    def __str__(self) -> str:
        return "%s %s"%(self.task, self.completed)
    





#add

class LocationInterest(models.Model):
    latitude = models.FloatField()
    longitude = models.FloatField()
    interest = models.TextField()

    def __str__(self):
        return self.interest
