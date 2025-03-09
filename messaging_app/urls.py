from django.urls import path
from .views import (
    create_conversation, 
    inbox_view, 
    send_message, 
    get_conversation, 
    list_user_conversations
)
urlpatterns = [
    path('conversation/create/', create_conversation, name='create_conversation'),
    path('conversation/<int:conversation_id>/', get_conversation, name='get_conversation'),
    path('conversations/user/<str:user_id>/', list_user_conversations, name='list_user_conversations'),
    path('conversation/<int:conversation_id>/send/', send_message, name='send_message'),
    path('inbox/', inbox_view, name='inbox_view'),
]
