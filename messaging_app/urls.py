from django.urls import path
from .views import create_conversation, inbox_view, send_message, get_conversation_messages

urlpatterns = [
    path('create_conversation/', create_conversation, name='create_conversation'),
    path('inbox/', inbox_view, name='inbox_view'),
    path('send_message/', send_message, name='send_message'),
    path('get_conversation_messages/<int:conversation_id>/', get_conversation_messages, name='get_conversation_messages'),
]
