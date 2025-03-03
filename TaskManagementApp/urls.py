from django.urls import path, include
from . import views
from .views import logout_view
from .views import login_view
from .views import home
from .views import get_csrf_token
urlpatterns = [
    path('', home, name='home'),
    path('delete/<int:list_id>', views.delete, name='delete'),
    path('save_location/', views.save_location, name='save_location'),
    path('get_location_interests/', views.get_location_interests, name='get_location_interests'),
    path('get_existing_data/', views.get_existing_data, name='get_existing_data'),
    path('nft/', views.nft_view, name='nft'),
    path('forum_discus/', views.forum_discus, name='forum_discus'),
    path('termsofuse/', views.termsofuse, name='termsofuse'),
    path('careers/', views.careers, name='careers'),
    path('corporate-policy/', views.corporate_policy, name='corporate_policy'),
    path('privacy-policy/', views.privacy_policy, name='privacy_policy'),
    path('sponser/', views.sponser_page, name='sponser'),
    path('about/', views.about_page, name='about'),
    path('contact/', views.contact_page, name='contact'),
    # Inbox page view
    # path('inbox/', views.inbox_page, name='inbox'),
    # Include messaging endpoints under /messaging/
    path('messaging/', include('messaging_app.urls')),
    path('api/login/', login_view, name='login'),
    path('api/logout/', logout_view, name='logout'),
    path('api/csrf/', get_csrf_token, name='csrf-token'),
    path('signup/', views.signup, name='signup'),
    
]
