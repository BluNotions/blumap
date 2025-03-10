from django.urls import path
from .views import (
    create_conversation, 
    inbox_view, 
    send_message, 
    get_conversation, 
    list_user_conversations,
    get_conversation_history,
    get_or_create_conversation
)

urlpatterns = [
    path('conversation/create/', create_conversation, name='create_conversation'),
    path('conversation/<int:conversation_id>/', get_conversation, name='get_conversation'),
    path('conversations/user/<str:user_id>/', list_user_conversations, name='list_user_conversations'),
    path('conversation/<int:conversation_id>/send/', send_message, name='send_message'),
    path('inbox/', inbox_view, name='inbox_view'),
    path('conversation/history/<str:current_user>/<str:other_user>/', get_conversation_history, name='get_conversation_history'),
    path('conversation/get-or-create/', get_or_create_conversation, name='get_or_create_conversation'),
]
