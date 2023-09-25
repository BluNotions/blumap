from django.urls import path
from . import views
from .views import get_existing_data

urlpatterns = [
    path('', views.home, name='home'),
    path('delete/<list_id>', views.delete, name='delete'),
    path('save_location', views.save_location, name='save_location'),
    path('get_location_interests/', views.get_location_interests, name='get_location_interests'),
    path('get_existing_data/', get_existing_data, name='get_existing_data'),
]
