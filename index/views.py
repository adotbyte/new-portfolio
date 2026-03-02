import json
import os
import subprocess
import markdown2
import re
from django.shortcuts import render
from django.http import JsonResponse, HttpResponse, Http404
from django.conf import settings
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST

# AI & RAG Imports from your new utils
from .utils import get_portfolio_collection, client as ai_client, genai, types
from .models import ChatHistory 
from .utils import get_portfolio_collection, client as ai_client, genai, types, ensure_session

# --- 1. INITIALIZATION ---
# Get the collection using the shared logic in utils.py
collection = get_portfolio_collection()

# --- 2. HELPERS ---
def ensure_session(request):
    if not request.session.session_key:
        request.session.create()
    request.session['active'] = True
    request.session.save()
    return request.session.session_key

def clean_django_tags(text):
    """Removes {% ... %} and {{ ... }} tags from the text."""
    text = re.sub(r'\{%.*?%\}', '', text)
    text = re.sub(r'\{\{.*?\}\}', '', text)
    return re.sub(r'\s+', ' ', text).strip()

# --- 3. VIEWS ---

def index(request):
    # This now calls the function from utils.py
    session_id = ensure_session(request) 
    history = ChatHistory.objects.filter(session_id=session_id).order_by('timestamp')
    
    sync_file = os.path.join(settings.BASE_DIR, "brain_sync.txt")
    last_sync = "Never"
    
    if os.path.exists(sync_file):
        with open(sync_file, "r") as f:
            last_sync = f.read().strip()
            
    return render(request, 'index.html', {
        'history': history,
        'last_sync': last_sync
    })

@csrf_exempt
@require_POST
def chat_with_gemini(request):
    try:
        session_id = ensure_session(request)
        body = json.loads(request.body)
        user_query = body.get('message', '')

        # 1. Save User Message
        ChatHistory.objects.create(session_id=session_id, role='user', message=user_query)

        # 2. RAG Retrieval
        results = collection.query(query_texts=[user_query], n_results=10)
        
        # 3. Clean Context for the AI
        cleaned_docs = [clean_django_tags(doc) for doc in results['documents'][0]] if results['documents'] else []
        context_text = "\n\n---\n\n".join(cleaned_docs) if cleaned_docs else "No specific project notes found."

        # 4. System Instruction
        sys_instr = f"""
        ## ROLE
        You are AdotByte, the digital assistant for Audrius.

        ## DATA FROM AUDRIUS'S FILES:
        {context_text}

        ## STRICT RULES:
        1. ONLY use the information provided in the "DATA FROM AUDRIUS'S FILES" section above.
        2. If the data is empty or does not mention "Commander Nova" (which it shouldn't!), DO NOT make up stories about space missions.
        3. If you don't find the Raspberry Pi info, say: "I can see your files, but I don't see the Raspberry Pi details. Let's check the ingestion."
        """

        # 5. Generate AI Response
        response = ai_client.models.generate_content(
            model="gemini-2.0-flash", 
            contents=user_query,
            config=types.GenerateContentConfig(system_instruction=sys_instr),
        )
        ai_text = response.text

        # 6. Save and Return
        formatted_ai_text = markdown2.markdown(ai_text, extras=['fenced-code-blocks', 'tables'])
        ChatHistory.objects.create(session_id=session_id, role='assistant', message=formatted_ai_text)

        return JsonResponse({'text': formatted_ai_text})

    except Exception as e:
        import traceback
        print(traceback.format_exc())
        return JsonResponse({'error': str(e)}, status=500)

# --- 4. OTHER VIEWS ---

# --- HELPERS ---
def get_last_sync():
    """A helper function so we don't repeat code in every view."""
    sync_file = os.path.join(settings.BASE_DIR, "brain_sync.txt")
    if os.path.exists(sync_file):
        with open(sync_file, "r") as f:
            return f.read().strip()
    return "Never"

# --- VIEWS ---

def index(request):
    """The Home/Chat Page"""
    session_id = ensure_session(request)
    history = ChatHistory.objects.filter(session_id=session_id).order_by('timestamp')
    
    return render(request, 'index.html', {
        'history': history,
    })

def about_me_view(request):
    """The Specialized About Me Page"""
    file_path = os.path.join(settings.BASE_DIR, 'about_me.md')
    html_content = "<p>Content coming soon!</p>"
    if os.path.exists(file_path):
        with open(file_path, 'r', encoding='utf-8') as f:
            html_content = markdown2.markdown(f.read(), extras=['fenced-code-blocks', 'tables'])
            
    return render(request, 'about_me.html', {
        'about_content': html_content,
    })

def my_knowledge(request):
    """The Technical Knowledge Page"""
    return render(request, 'my_knowledge.html', {
    })

@csrf_exempt
def delete_chat_history(request):
    if request.method == "POST":
        session_id = request.session.session_key
        if session_id:
            ChatHistory.objects.filter(session_id=session_id).delete()
            return JsonResponse({"status": "success"})
    return JsonResponse({"status": "error"}, status=400)

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