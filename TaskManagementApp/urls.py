from django.urls import path, include
from . import views
from .views import logout_view
from .views import login_view
from .views import get_csrf_token
from .views import accept_friend_request
from .views import check_user

urlpatterns = [
    # Frontend Endpoints
    path('', views.home, name='home'), # type: ignore
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
    path('sponsor/', views.sponsor_page, name='sponsor'),
    path('about/', views.about_page, name='about'),
    path('contact/', views.contact_page, name='contact'),
    path('signup/', views.signup, name='signup'),
    
   # Backend API Endpoints
    path('api/login/', login_view, name='login'),
    path('api/logout/', logout_view, name='logout'),
    path('api/csrf/', get_csrf_token, name='csrf-token'),
    path('api/check_user/', check_user, name='check_user'),
    # path('api/send_friend_request_email/', send_friend_request_email, name='send_friend_request_email'),
    # path('accept_request/<int:request_id>/', accept_friend_request, name='accept_friend_request'),

    #  messaging
    path('messaging/', include('messaging_app.urls')),

    path('friend-request/send', views.send_friend_request, name='send_friend_request'),
    path('friend-request/accept/<int:request_id>', views.accept_friend_request, name='accept_friend_request'),
    path('friend-request/reject/<int:request_id>', views.reject_friend_request, name='reject_friend_request'),
    path('friend-request/friends/<int:user_id>', views.list_friends, name='list_friends'),

]
