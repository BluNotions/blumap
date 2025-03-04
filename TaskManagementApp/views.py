from django.shortcuts import render, redirect, get_object_or_404
from .models import taskDb, LocationInterest, Locations
from .forms import TaskForm
from .forms import SignupForm
from django.contrib import messages
from django.http import JsonResponse
from django.http import HttpResponse
from django.contrib.auth import logout, login, authenticate
from django.middleware.csrf import get_token
from django.conf import settings
from django.views.decorators.csrf import csrf_exempt
import json
from django.contrib.auth.models import User
from .models import UserProfile
from django.core.mail import send_mail  # Import send_mail


from django.shortcuts import render

def nft_view(request):
    return render(request, 'nft.html')

def sponser_page(request):
    return render(request, 'sponser.html') 

def contact_page(request):
    return render(request, 'contact.html') 

def about_page(request):
    return render(request, 'about.html') 

def inbox_page(request):
    return render(request, 'inbox.html')

def forum_discus(request):
    return render(request, 'forum_discus.html')

def termsofuse(request):
    return render(request, 'termsofuse.html')

def careers(request):
    return render(request, 'careers.html')

def corporate_policy(request):
    return render(request, 'corporatepolicy.html')

def privacy_policy(request):
    return render(request, 'privacypolicy.html')


def home(request):
    if request.method == 'POST':
        form = TaskForm(request.POST or None)
        if form.is_valid():
            form.save()
            all_items = taskDb.objects.all()
            messages.success(request, 'New item added')
            return render(request, 'index.html', {'all_items': all_items, 'google_maps_api_key': settings.GOOGLE_MAPS_API_KEY})
    else:
        all_items = taskDb.objects.all()
        return render(request, 'index.html', {'all_items': all_items, 'google_maps_api_key': settings.GOOGLE_MAPS_API_KEY})




def delete(request, list_id):
    item = taskDb.objects.get(pk=list_id)
    item.delete()
    messages.success(request, 'item deleted')
    return redirect('home')

def save_location(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        print(f"Received data: {data}")  # Log the received data
        name = data.get('name', 'Unknown Name')  # Default to 'Unknown Name'
        email = data.get('email', 'unknown@example.com')  # Default to a placeholder email
        phone_number = data.get('phone_number', '000-000-0000')  # Default to a placeholder phone number
        lat = data.get('latitude', 0.0)  # Default to 0.0 for latitude
        lng = data.get('longitude', 0.0)  # Default to 0.0 for longitude
        geohash = data.get('geohash', '000000000000')  # Default to a placeholder geohash
        description = data.get('description', 'No description provided')  # Default description
        category = data.get('category', 'Community')  # Default to 'Community'
        created_by = data.get('created_by', 'System')  # Default to 'System'
        updated_by = data.get('updated_by', 'System')  # Default to 'System'
        
        # New fields added
        status = data.get('status', 'Pending')  # Default to 'Pending'
        priority = data.get('priority', 'Medium')  # Default to 'Medium'
        tags = data.get('tags', {})  # Default to empty JSONB
        attachments = data.get('attachments', {})  # Default to empty JSONB
        resolved_date = data.get('resolved_date')  # Optional field

        location = Locations(
            Name=name,
            Email=email,
            Phone_Number=phone_number,
            Latitude=lat,
            Longitude=lng,
            GeoHash=geohash,
            Description=description,
            Category=category,
            Status=status,
            Priority=priority,
            Tags=tags, 
            Attachments=attachments,
            Created_By=created_by,
            Updated_By=updated_by,
            Resolved_Date=resolved_date
        )
        
        # Validate the model instance
        try:
            location.full_clean()  # This will raise a ValidationError if invalid
            location.save()  # Save the location instance
            print("Location saved successfully")  # Log successful save
            return JsonResponse({'status': 'success', 'message': 'Data saved successfully'})
        except Exception as e:
            print(f"Validation error: {e}")  # Log the validation error
            return JsonResponse({'status': 'error', 'message': str(e)})
    else:
        return JsonResponse({'status': 'error', 'message': 'Invalid request method'})

def get_location_interests(request):
    data = list(LocationInterest.objects.values('latitude', 'longitude', 'interest', 'need'))
    return JsonResponse(data, safe=False)

def get_existing_data(request):
    data = Locations.objects.values('Name', 'Latitude', 'Longitude', 'Category','Description')
    return JsonResponse(list(data), safe=False)

def set_cookie(request):
    response = HttpResponse("Cookie has been set!")
    response.set_cookie('cookie_name', 'cookie_value', max_age=3600)
    return response

def logout_view(request):
    logout(request)  # This clears the Django user session (if used)
    request.session.flush()  # This clears any other session data (like Web3Auth tokens you might have stored)
    return JsonResponse({'message': 'Logged out successfully'})

@csrf_exempt
def check_user(request):
        try:
            data = json.loads(request.body)
            identifier = data.get('identifier')
            profile = UserProfile.objects.get(user__email=identifier)  # Check by email
            return JsonResponse(profile)
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)})
        

def send_friend_request_email(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        email = data.get('email')  # Get the email from the request

        if email:
            try:
                send_mail(
                    'Friend Request',  # Subject
                    'You have received a friend request!',  # Message
                    settings.DEFAULT_FROM_EMAIL,  # From email (set in settings.py)
                    [email],  # Recipient list
                    fail_silently=False,
                )
                return JsonResponse({'status': 'success', 'message': 'Email sent successfully'})
            except Exception as e:
                return JsonResponse({'status': 'error', 'message': str(e)})
        else:
            return JsonResponse({'status': 'error', 'message': 'Email address is required'})
    else:
        return JsonResponse({'status': 'error', 'message': 'Invalid request method'})

def get_csrf_token(request):
    token = get_token(request)
    return JsonResponse({'csrfToken': token})

def signup(request):
    if request.method == 'POST':
        form = SignupForm(request.POST)
        if form.is_valid():
            user = form.save()  # This creates the User instance
            UserProfile.objects.create(user=user)  # Create UserProfile instance
            messages.success(request, 'Registration successful')
            return redirect('home')
    else:
        form = SignupForm()
    return render(request, 'signup.html', {'form': form})

@csrf_exempt
def login_view(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            identifier = data.get('identifier')  # This will be either email or mobile number
            password = data.get('password')

            print(f"Received identifier: {identifier}, password: {password}")  # Debug statement

            if not identifier or not password:
                return JsonResponse({'success': False, 'message': 'Identifier (email or mobile) and password are required'}, status=400)

            # Try to find the user by email or mobile number
            try:
                user_profile = UserProfile.objects.get(user__email=identifier)  # Check by email
            except UserProfile.DoesNotExist:
                try:
                    user_profile = UserProfile.objects.get(phone_number=identifier)  # Check by mobile number
                except UserProfile.DoesNotExist:
                    return JsonResponse({'success': False, 'message': 'Invalid credentials'}, status=400)

            # Authenticate the user using the username (which is the User's email)
            user = authenticate(request, username=user_profile.user.username, password=password)
            if user is not None:
                return JsonResponse({'success': True, 'user': user_profile.user.email})
            else:
                return JsonResponse({'success': False, 'message': 'Invalid credentials'}, status=400)
        except json.JSONDecodeError:
            return JsonResponse({'success': False, 'message': 'Invalid JSON'}, status=400)
    else:
        return JsonResponse({'success': False, 'message': 'Invalid request method'}, status=400)

def accept_friend_request(request, request_id):
    if request.method == 'GET':
        try:
            # Assuming you have a FriendRequest model to manage friend requests
            friend_request = get_object_or_404(FriendRequest, id=request_id)
            user = request.user  # Get the currently logged-in user
            
            # Update the user's friend list
            user.friends.add(friend_request.sender)  # Assuming sender is the user who sent the request
            friend_request.delete()  # Remove the friend request after acceptance
            
            return render(request, 'accept_request.html')
        except Exception as e:
            messages.error(request, f'Error accepting friend request: {str(e)}')
            return redirect('home')  # Redirect to home or an appropriate page
    else:
        return JsonResponse({'status': 'error', 'message': 'Invalid request method'})
