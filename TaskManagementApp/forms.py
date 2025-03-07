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
    # verification_type = forms.ChoiceField(choices=[
    #     ('email', 'Email'),
    #     ('sms', 'SMS'),
    #     ('call', 'Call'),
    # ])
    phone_number = forms.CharField(max_length=15, required=False)

    class Meta:
        model = User
        fields = ('username', 'email', 'password1', 'password2')

    def save(self, commit=True):
        user = super().save(commit)
        # Check if the UserProfile already exists
        profile, created = UserProfile.objects.get_or_create(user=user)
        profile.phone_number = self.cleaned_data['phone_number']
        # profile.verification_type = self.cleaned_data['verification_type']
        
        if commit:
            user.save()
            profile.save()
        return user