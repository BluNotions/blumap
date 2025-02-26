import json
from django.shortcuts import render, redirect, get_object_or_404
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.models import User
from .models import Conversation, Message

# OPTIONAL: if you want to do server-side toxicity checks with Perspective
import requests

PERSPECTIVE_API_KEY = "YOUR_PERSPECTIVE_API_KEY"

def check_toxicity(text):
    """
    Server-side check using Google's Perspective API.
    """
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
        return data["attributeScores"]["TOXICITY"]["summaryScore"]["value"]
    except:
        return 0.0  # fallback if API fails

def contains_dirty_words(text):
    """
    A stricter filter for banned words, same as your client-side.
    """
    banned_words = [
        "fuck","shit","damn","bitch","asshole","crap","dick","piss","pussy","cock",
        "whore","slut","bastard","motherfucker","cunt","dildo","wanker","twat","fag",
        "nigger","retard","chink","spic","kike","dyke","coon","gook","tranny","queer",
        "beyonce","kanyewest","taylorswift","elonmusk","kimkardashian","justinbieber",
        "drake","rihanna","leomessi","cristianoronaldo","sex","penis","vagina","boobs",
        "anal","blowjob","clitoris","orgasm","masturbate","porn","ejaculate","condom",
        "dildo","viagra","allah","jesus","buddha","hindu","torah","quran","bible",
        "mosque","synagogue","church","atheist","jihad","halal","kosher","crusade"
    ]
    lower_text = text.lower()
    for w in banned_words:
        if w in lower_text:
            return True
    return False

@csrf_exempt
def create_conversation(request):
    """
    Called when user clicks "Help" on the main map page:
    1) Check if conversation already exists (if you want to limit to 1-to-1).
    2) If not, create it.
    3) Create a "Hello, I'd like to help" message.
    """
    if request.method == 'POST':
        data = json.loads(request.body)
        # data might contain 'sender_id' or 'sender_email' and 'recipient_id' or 'recipient_email'
        sender_email = data.get('sender_email')
        recipient_email = data.get('recipient_email')
        
        # Make sure we have both users
        try:
            sender = User.objects.get(email=sender_email)
            recipient = User.objects.get(email=recipient_email)
        except User.DoesNotExist:
            return JsonResponse({"error": "User(s) not found"}, status=400)
        
        # If you want to limit to 1-to-1, check if a conversation already exists
        conversation = Conversation.objects.filter(participants=sender).filter(participants=recipient).first()
        
        if not conversation:
            conversation = Conversation.objects.create()
            conversation.participants.add(sender, recipient)
            conversation.save()
        
        # Create a default message in that conversation
        default_text = "Hi! I saw your need on Blumaps. I'd like to help."
        toxicity_score = check_toxicity(default_text)
        is_blocked = (toxicity_score > 0.7) or contains_dirty_words(default_text)
        message_obj = Message.objects.create(
            conversation=conversation,
            sender=sender,
            text=default_text,
            is_toxic=(toxicity_score > 0.7),
            blocked_for_toxicity=is_blocked
        )
        return JsonResponse({
            "success": True,
            "conversation_id": conversation.id,
            "message_id": message_obj.id
        })
    return JsonResponse({"error": "Invalid request method"}, status=405)

def inbox_view(request):
    """
    Renders your inbox.html template, possibly with conversation list pre-fetched.
    """
    if not request.user.is_authenticated:
        # redirect to login or show a message
        return redirect('login')
    # Get all conversations for this user
    user_conversations = request.user.conversations.all().order_by('-created_at')
    # Preload the last message, etc. if you want
    context = {
        "conversations": user_conversations
    }
    return render(request, "inbox.html", context)

@csrf_exempt
def send_message(request):
    """
    AJAX POST to send a new message in a conversation. 
    We'll check toxicity server-side, too.
    """
    if request.method == 'POST':
        data = json.loads(request.body)
        conversation_id = data.get('conversation_id')
        sender_id = data.get('sender_id')
        text = data.get('text', '').strip()
        
        if not conversation_id or not sender_id:
            return JsonResponse({"error": "Missing conversation_id or sender_id"}, status=400)
        
        conversation = get_object_or_404(Conversation, id=conversation_id)
        sender = get_object_or_404(User, id=sender_id)
        
        if sender not in conversation.participants.all():
            return JsonResponse({"error": "User not in conversation"}, status=403)
        
        toxicity_score = check_toxicity(text)
        is_blocked = (toxicity_score > 0.7) or contains_dirty_words(text)
        
        msg = Message.objects.create(
            conversation=conversation,
            sender=sender,
            text=text,
            is_toxic=(toxicity_score > 0.7),
            blocked_for_toxicity=is_blocked
        )
        return JsonResponse({
            "success": True,
            "message_id": msg.id,
            "blocked_for_toxicity": is_blocked,
            "toxicity_score": toxicity_score
        })
    return JsonResponse({"error": "Invalid request method"}, status=405)

def get_conversation_messages(request, conversation_id):
    """
    Returns the messages in a conversation as JSON, for your 
    JS to load into the conversation modal, etc.
    """
    conversation = get_object_or_404(Conversation, id=conversation_id)
    if request.user not in conversation.participants.all():
        return JsonResponse({"error": "You are not part of this conversation"}, status=403)
    
    msgs = conversation.messages.order_by('timestamp').values(
        'id', 'sender__username', 'text', 'timestamp',
        'is_toxic','blocked_for_toxicity'
    )
    return JsonResponse(list(msgs), safe=False)
