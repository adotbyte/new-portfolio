import json
import os
import subprocess
import markdown2
import re
import traceback
from django.shortcuts import render
from django.http import JsonResponse, HttpResponse, Http404
from django.conf import settings
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST

# AI & RAG Imports
from .utils import get_portfolio_collection, ai_client, genai, types, ensure_session
from .models import ChatHistory 

# --- 1. INITIALIZATION ---
collection = get_portfolio_collection()

# --- 2. HELPERS ---
def clean_django_tags(text):
    """Removes {% ... %} and {{ ... }} tags from the text."""
    text = re.sub(r'\{%.*?%\}', '', text)
    text = re.sub(r'\{\{.*?\}\}', '', text)
    return re.sub(r'\s+', ' ', text).strip()

def get_last_sync_time():
    """Helper to read the brain_sync.txt file."""
    sync_file = os.path.join(settings.BASE_DIR, "brain_sync.txt")
    if os.path.exists(sync_file):
        with open(sync_file, "r") as f:
            return f.read().strip()
    return "Never"

# --- 3. MAIN VIEWS ---

def index(request):
    """The Home/Chat Page - Combined with Sync Logic"""
    session_id = ensure_session(request) 
    history = ChatHistory.objects.filter(session_id=session_id).order_by('timestamp')
    last_sync = get_last_sync_time()
            
    return render(request, 'index.html', {
        'history': history,
        'last_sync': last_sync
    })

@csrf_exempt
@require_POST
def chat_with_gemini(request):
    """Handles the AI Chat logic"""
    try:
        session_id = ensure_session(request)
        body = json.loads(request.body)
        user_query = body.get('message', '').strip()

        if not user_query:
            return JsonResponse({'error': 'Empty message'}, status=400)

        # 1. Save User Message
        ChatHistory.objects.create(session_id=session_id, role='user', message=user_query)

        # 2. RAG Retrieval (Limit to 5 focused results)
        results = collection.query(query_texts=[user_query], n_results=5)
        
        # 3. Clean Context
        cleaned_docs = []
        if results['documents'] and results['documents'][0]:
            cleaned_docs = [clean_django_tags(doc) for doc in results['documents'][0]]
        
        context_text = "\n\n---\n\n".join(cleaned_docs) if cleaned_docs else "No project data found for this query."

        # 4. System Instruction
        sys_instr = f"""
        ## ROLE
        You are AdotByte, the digital assistant for Audrius.

        ## DATA FROM AUDRIUS'S FILES:
        {context_text}

        ## STRICT RULES:
        1. ONLY use the information provided above.
        2. If you don't find specific info (like Raspberry Pi), say: "I don't see those details in my current brain sync."
        3. Keep answers concise.
        """

        # 5. Generate AI Response 
        # Note: Using gemini-2.0-flash for stability
        response = ai_client.models.generate_content(
            model="gemini-2.0-flash", 
            contents=user_query,
            config=types.GenerateContentConfig(system_instruction=sys_instr),
        )
        ai_text = response.text

        # 6. Format and Save
        formatted_ai_text = markdown2.markdown(ai_text, extras=['fenced-code-blocks', 'tables'])
        ChatHistory.objects.create(session_id=session_id, role='assistant', message=formatted_ai_text)

        return JsonResponse({'text': formatted_ai_text})

    except Exception as e:
        print(traceback.format_exc())
        return JsonResponse({'error': f"AI Connection Error: {str(e)}"}, status=500)

# --- 4. NAVIGATION & PAGES ---

def about_me_view(request):
    """Specialized About Me Page"""
    file_path = os.path.join(settings.BASE_DIR, 'about_me.md')
    html_content = "<p>Content coming soon!</p>"
    if os.path.exists(file_path):
        with open(file_path, 'r', encoding='utf-8') as f:
            html_content = markdown2.markdown(f.read(), extras=['fenced-code-blocks', 'tables'])
            
    return render(request, 'about_me.html', {'about_content': html_content})

def my_knowledge(request):
    """Technical Knowledge Page"""
    return render(request, 'my_knowledge.html')

def privacy(request):
    return render(request, 'privacy.html')

@csrf_exempt
@require_POST
def delete_chat_history(request):
    """Clears history for the current session"""
    session_id = request.session.session_key
    if session_id:
        ChatHistory.objects.filter(session_id=session_id).delete()
        return JsonResponse({"status": "success"})
    return JsonResponse({"status": "error"}, status=400)

# --- 5. BLOG & GITHUB ---

def blog_index(request):
    posts_dir = os.path.join(settings.BASE_DIR, 'index', 'blog')
    posts = [f.replace('.md', '') for f in os.listdir(posts_dir) if f.endswith('.md')] if os.path.exists(posts_dir) else []
    return render(request, 'blog.html', {'posts': posts})

def blog_post_detail(request, slug):
    file_path = os.path.join(settings.BASE_DIR, 'index', 'blog', f'{slug}.md')
    if not os.path.exists(file_path): raise Http404("Post not found")
    with open(file_path, 'r', encoding='utf-8') as f:
        html_content = markdown2.markdown(f.read(), extras=['fenced-code-blocks', 'tables'])
    return render(request, 'blog.html', {'content': html_content, 'title': slug.replace('-', ' ').title()})

@csrf_exempt
@require_POST
def github_webhook(request):
    subprocess.run(['git', 'pull', 'origin', 'main'], check=True)
    return HttpResponse("OK")