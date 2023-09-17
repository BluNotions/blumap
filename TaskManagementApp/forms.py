from django import forms
from .models import taskDb

class TaskForm(forms.ModelForm):
    class Meta:
        model = taskDb
        fields = ['task', 'priority']