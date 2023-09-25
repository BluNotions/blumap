from django.shortcuts import render, redirect
from .models import taskDb
from .forms import TaskForm
from django.contrib import messages


#add
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from .models import LocationInterest
import json




def home(request):

    if request.method == 'POST':
        form = TaskForm(request.POST or None)

        if form.is_valid():
            form.save()
            all_items = taskDb.objects.all()
            messages.success(request, ('New item added'))
            return render (request, 'index.html',{ 'all_items':all_items})
            

    else:

         all_items = taskDb.objects.all()
         return render (request, 'index.html',{ 'all_items':all_items})
   

def delete(request, list_id):

    item = taskDb.objects.get(pk=list_id)
    item.delete()
    messages.success(request, ('item deleted'))
    return redirect ('home')





#added
def save_location(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        lat = data.get('latitude')
        lng = data.get('longitude')
        interest = data.get('need')

        location_interest = LocationInterest(latitude=lat, longitude=lng, interest=interest)
        location_interest.save()

        return JsonResponse({'status': 'success', 'message': 'Data saved successfully'})
    else:
        return JsonResponse({'status': 'error', 'message': 'Invalid request method'})
  



def get_location_interests(request):
    data = list(LocationInterest.objects.values('latitude', 'longitude', 'interest', 'need'))
    return JsonResponse(data, safe=False)


def get_existing_data(request):
    data = LocationInterest.objects.values('id', 'latitude', 'longitude', 'interest')
    return JsonResponse(list(data), safe=False)