import json
import requests
from django.shortcuts import render, get_object_or_404
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.models import User
from django.urls import path
from .models import Conversation, Message

# OPTIONAL: Uncomment and set your Perspective API key if you want server-side toxicity checks.
# PERSPECTIVE_API_KEY = "YOUR_PERSPECTIVE_API_KEY"

def check_toxicity(text):
    """
    Check text toxicity using Google's Perspective API.
    If no API key is provided, simply returns 0.0.
    """
    if not globals().get("PERSPECTIVE_API_KEY"):
        return 0.0
    url = f"https://commentanalyzer.googleapis.com/v1alpha1/comments:analyze?key={PERSPECTIVE_API_KEY}"
    payload = {
        "comment": {"text": text},
        "languages": ["en"],
        "requestedAttributes": {"TOXICITY": {}}
    }
    headers = {"Content-Type": "application/json"}
    try:
        response = requests.post(url, headers=headers, data=json.dumps(payload))
        response.raise_for_status()
        data = response.json()
        return data.get("attributeScores", {}).get("TOXICITY", {}).get("summaryScore", {}).get("value", 0.0)
    except Exception:
        return 0.0

def contains_dirty_words(text):
    """
    Checks if the text contains any banned words.
    """
    banned_words = [
        "fuck", "shit", "damn", "bitch", "asshole", "crap", "dick", "piss",
        "pussy", "cock", "whore", "slut", "bastard", "motherfucker", "cunt",
        "dildo", "wanker", "twat", "fag", "nigger", "retard", "chink", "spic",
        "kike", "dyke", "coon", "gook", "tranny", "queer", "beyonce", "kanyewest",
        "taylorswift", "elonmusk", "kimkardashian", "justinbieber", "drake",
        "rihanna", "leomessi", "cristianoronaldo", "sex", "penis", "vagina",
        "boobs", "anal", "blowjob", "clitoris", "orgasm", "masturbate", "porn",
        "ejaculate", "condom", "dildo", "viagra", "allah", "jesus", "buddha",
        "hindu", "torah", "quran", "bible", "mosque", "synagogue", "church",
        "atheist", "jihad", "halal", "kosher", "crusade"
    ]
    lower_text = text.lower()
    return any(word in lower_text for word in banned_words)

def send_message_to_conversation(conversation, sender, text):
    """
    Helper function to create a message in a conversation.
    Performs toxicity checking and marks the message accordingly.
    """
    toxicity_score = check_toxicity(text)
    is_toxic = toxicity_score > 0.7
    is_blocked = is_toxic or contains_dirty_words(text)
    message = Message.objects.create(
        conversation=conversation,
        sender=sender,
        text=text,
        is_toxic=is_toxic,
        blocked_for_toxicity=is_blocked
    )
    return message, toxicity_score, is_blocked

@csrf_exempt
def create_conversation(request):
    """
    Creates a new conversation between two users and sends an initial message.
    Expected JSON body:
      {
          "sender_username": "user1",
          "recipient_username": "user2",
          "message": "Optional initial message text"
      }
    """
    if request.method != 'POST':
        return JsonResponse({"error": "Invalid request method"}, status=405)

    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid JSON"}, status=400)

    sender_username = data.get('sender_username')
    recipient_username = data.get('recipient_username')
    message_text = data.get('message', "Hi! I'd like to help.")

    if not sender_username or not recipient_username:
        return JsonResponse({"error": "Missing sender_username or recipient_username"}, status=400)

    try:
        sender = User.objects.get(username=sender_username)
        recipient = User.objects.get(username=recipient_username)
    except User.DoesNotExist:
        return JsonResponse({"error": "User(s) not found"}, status=400)

    # Check if a conversation already exists between the two users.
    conversation = Conversation.objects.filter(participants=sender).filter(participants=recipient).first()
    if not conversation:
        conversation = Conversation.objects.create()
        conversation.participants.add(sender, recipient)
        conversation.save()

    message, toxicity_score, is_blocked = send_message_to_conversation(conversation, sender, message_text)
    return JsonResponse({
        "success": True,
        "conversation_id": conversation.id,
        "message_id": message.id,
        "toxicity_score": toxicity_score,
        "blocked_for_toxicity": is_blocked
    })

@csrf_exempt
def get_conversation(request, conversation_id):
    """
    Retrieves a conversation and its messages.
    Only participants of the conversation can access it.
    """
    conversation = get_object_or_404(Conversation, id=conversation_id)
    # Optionally, check if request.user is in conversation.participants here.
    if request.user not in conversation.participants.all():
        return JsonResponse({"error": "You are not part of this conversation"}, status=403)
    
    messages = conversation.messages.order_by('timestamp').values(
        'id', 'sender__username', 'text', 'timestamp',
        'is_toxic', 'blocked_for_toxicity'
    )
    return JsonResponse({
        "conversation_id": conversation.id,
        "messages": list(messages)
    })

@csrf_exempt
def list_user_conversations(request, user_id):
    """
    Lists all conversations for a specific user (identified by email).
    """
    try:
        user = User.objects.get(email=user_id)
    except User.DoesNotExist:
        return JsonResponse({"error": "User not found"}, status=404)

    conversations = Conversation.objects.filter(participants=user).order_by('-created_at')
    conversations_data = []
    for convo in conversations:
        latest_msg = convo.messages.last()
        conversations_data.append({
            "id": convo.id,
            "participants": [participant.username for participant in convo.participants.all()],
            "latest_message": latest_msg.text if latest_msg else ""
        })
    return JsonResponse(conversations_data, safe=False)

@csrf_exempt
def send_message(request, conversation_id):
    """
    Sends a new message in an existing conversation or creates a new conversation if it doesn't exist.
    Expected JSON body:
      {
          "sender_username": "user1",
          "recipient_username": "user2",
          "text": "Message text"
      }
    """
    if request.method != 'POST':
        return JsonResponse({"error": "Invalid request method"}, status=405)

    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid JSON"}, status=400)

    sender_username = data.get('sender_username')
    recipient_username = data.get('recipient_username')
    text = data.get('text', '').strip()

    if not sender_username or not recipient_username or not text:
        return JsonResponse({"error": "Missing sender_username, recipient_username, or text"}, status=400)

    try:
        sender = User.objects.get(username=sender_username)
        recipient = User.objects.get(username=recipient_username)
    except User.DoesNotExist:
        return JsonResponse({"error": "User(s) not found"}, status=400)

    # Check if a conversation already exists between the two users.
    conversation = Conversation.objects.filter(participants=sender).filter(participants=recipient).first()
    if not conversation:
        conversation = Conversation.objects.create()
        conversation.participants.add(sender, recipient)
        conversation.save()

    message, toxicity_score, is_blocked = send_message_to_conversation(conversation, sender, text)
    return JsonResponse({
        "success": True,
        "conversation_id": conversation.id,
        "message_id": message.id,
        "toxicity_score": toxicity_score,
        "blocked_for_toxicity": is_blocked
    })

def inbox_view(request):
    """
    Renders the inbox.html template with the user's conversations.
    The user is identified by the query parameter 'id' (user email).
    """
    if request.method != 'GET':
        return JsonResponse({"error": "Invalid request method"}, status=405)

    user_email = request.GET.get('id')
    if not user_email:
        return JsonResponse({"error": "User email is required"}, status=400)

    try:
        user = User.objects.get(email=user_email)
    except User.DoesNotExist:
        return JsonResponse({"error": "User not found"}, status=404)

    conversations = Conversation.objects.filter(participants=user).order_by('-created_at')
    context = {"conversations": conversations}
    return render(request, "inbox.html", context)

# URL patterns for routing these views