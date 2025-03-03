from django.apps import AppConfig


class TaskmanagementappConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'TaskManagementApp'

def ready(self):
  import TaskManagementApp.signals

class MessagingAppConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'messaging_app'