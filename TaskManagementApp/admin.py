from django.contrib import admin

# Register your models here.

from .models import taskDb

admin.site.register(taskDb)