from django import forms
from .models import taskDb
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth.models import User
from django import forms
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth.models import User
from .models import UserProfile

class TaskForm(forms.ModelForm):
    class Meta:
        model = taskDb
        fields = ['task', 'priority']

 




class SignupForm(UserCreationForm):
    verification_type = forms.CharField(max_length=50, required=False)
    phone_number = forms.CharField(max_length=15, required=False)

    class Meta:
        model = User
        fields = ('username', 'email', 'password1', 'password2', 'verification_type', 'phone_number')

    def save(self, commit=True):
        user = super().save(commit)
        profile = UserProfile(user=user)
        profile.verification_type = self.cleaned_data['verification_type']
        profile.phone_number = self.cleaned_data['phone_number']
        if commit:
            user.save()
            profile.save()
        return user