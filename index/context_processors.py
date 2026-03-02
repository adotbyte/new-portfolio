from .models import ChatHistory  # Use the name from your views.py

def chat_history_processor(request):
    # 1. Ensure a session exists so we have a key to filter by
    if not request.session.session_key:
        request.session.create()
    
    session_id = request.session.session_key
    
    # 2. Fetch messages for this specific session
    # We use 'session_id' because that's what you used in views.py
    history = ChatHistory.objects.filter(session_id=session_id).order_by('timestamp')
        
    return {
        'history': history 
    }

### Brain sync

import os
from django.conf import settings

def sync_info(request):
    sync_file = os.path.join(settings.BASE_DIR, "brain_sync.txt")
    last_sync = "Never"
    if os.path.exists(sync_file):
        with open(sync_file, "r") as f:
            last_sync = f.read().strip()
    return {'last_sync': last_sync}