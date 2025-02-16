from django.shortcuts import render, redirect
from .models import taskDb, LocationInterest, Locations
from .forms import TaskForm
from django.contrib import messages
from django.http import JsonResponse
from django.conf import settings
import json


from django.shortcuts import render

def nft_view(request):
    return render(request, 'nft.html')


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
