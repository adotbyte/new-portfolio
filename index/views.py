import json
import os
import subprocess
import markdown2
from django.shortcuts import render
from django.http import JsonResponse, HttpResponse, Http404
from django.conf import settings
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST
from google import genai
from google.genai import types
from bs4 import BeautifulSoup
from .models import ChatHistory  # Consolidating to use ChatHistory consistently

# --- INITIALIZATION ---
client = genai.Client(api_key=settings.GEMINI_API_KEY)

# --- HELPER FUNCTIONS ---

def ensure_session(request):
    """Forces session creation and persistence across page reloads."""
    if not request.session.session_key:
        request.session.create()
    request.session['active'] = True  # Ensures cookie is sent to browser
    request.session.save() # Forces the DB to write and generate the key NOW

    # Debug print - if this says 'None', the history will never save
    print(f"DEBUG: Current Session ID is: {request.session.session_key}")

# --- CORE PAGE VIEWS ---

def index(request):
    """Main landing page."""
    ensure_session(request) 
    session_id = request.session.session_key
    
    # We tell Django the session has changed to keep the ID stable
    request.session.modified = True
    
    # Fetch ONLY what is currently in the DB
    history = ChatHistory.objects.filter(session_id=session_id).order_by('timestamp')
    
    return render(request, 'index.html', {'history': history})

def about_me_view(request):
    """Renders about_me.md as HTML."""
    file_path = os.path.join(settings.BASE_DIR, 'about_me.md')
    html_content = "<p>Content coming soon!</p>"
    if os.path.exists(file_path):
        with open(file_path, 'r', encoding='utf-8') as f:
            html_content = markdown2.markdown(f.read(), extras=['fenced-code-blocks', 'tables'])
    return render(request, 'about_me.html', {'about_content': html_content})

def my_knowledge(request):
    return render(request, 'my_knowledge.html')

# --- AI CHAT LOGIC (RAG) ---

import chromadb
from chromadb import Documents, EmbeddingFunction, Embeddings

class GeminiEmbeddingFunction(EmbeddingFunction):
    def __init__(self, client, model_name="models/gemini-embedding-001"):
        self.client = client
        self.model_name = model_name

    def __call__(self, input: Documents) -> Embeddings:
        response = self.client.models.embed_content(
            model=self.model_name,
            contents=input,
            config=types.EmbedContentConfig(task_type="RETRIEVAL_DOCUMENT")
        )
        return [e.values for e in response.embeddings]

# Initialize Search Engine
gemini_ef = GeminiEmbeddingFunction(client=client)
chroma_client = chromadb.PersistentClient(path=os.path.join(settings.BASE_DIR, "chroma_db"))
collection = chroma_client.get_or_create_collection(
    name="portfolio_data", 
    embedding_function=gemini_ef
)

@csrf_exempt
def chat_with_gemini(request):
    try:
        ensure_session(request)
        body = json.loads(request.body)
        user_query = body.get('message', '')

        # 1. RETRIEVAL: Pull 5 chunks for better coverage
        results = collection.query(query_texts=[user_query], n_results=7)
        
        # DEBUG: Look at your Pi Terminal to see what was found!
        print(f"DEBUG: Found {len(results['documents'][0])} chunks for query: {user_query}")
        
        context_text = "\n".join(results['documents'][0])

        # 2. AUGMENTATION: A more helpful prompt
        sys_instr = (
            f"You are AdotByte, Audrius's professional AI assistant. "
            f"Based on the following data: \n{context_text}\n "
            "When asked for 'Top 3 achievements', select the 3 most complex technical "
            "milestones from the text and present them confidently as his key achievements."
        )
        # 3. GENERATION
        response = client.models.generate_content(
            model="gemini-2.0-flash", # Use 2.0-flash for best stability in 2026
            contents=user_query,
            config=types.GenerateContentConfig(system_instruction=sys_instr)
        )

        return JsonResponse({'text': response.text})

    except Exception as e:
        print(f"AI ERROR: {e}") # Log error to terminal
        return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
def delete_chat_history(request):
    if request.method == "POST":
        session_id = request.session.session_key
        if session_id:
            deleted = ChatHistory.objects.filter(session_id=session_id).delete()
            print(f"DEBUG: Deleted {deleted} messages for session {session_id}")
            return JsonResponse({"status": "success"})
        else:
            print("DEBUG: No session key found to delete")
            return JsonResponse({"status": "error", "message": "No session"}, status=400)
    return JsonResponse({"status": "error"}, status=400)

# --- BLOG LOGIC ---

def blog_index(request):
    posts_dir = os.path.join(settings.BASE_DIR, 'index', 'blog')
    posts = [f.replace('.md', '') for f in os.listdir(posts_dir) if f.endswith('.md')] if os.path.exists(posts_dir) else []
    return render(request, 'blog.html', {'posts': posts})

def blog_post_detail(request, slug):
    file_path = os.path.join(settings.BASE_DIR, 'index', 'blog', f'{slug}.md')
    if not os.path.exists(file_path):
        raise Http404("Post not found")
    with open(file_path, 'r', encoding='utf-8') as f:
        html_content = markdown2.markdown(f.read(), extras=['fenced-code-blocks', 'tables'])
    return render(request, 'blog.html', {'content': html_content, 'title': slug.replace('-', ' ').title()})

# --- UTILITY VIEWS ---

@csrf_exempt
@require_POST
def github_webhook(request):
    """Automates git pull on push."""
    try:
        subprocess.run(['git', 'pull', 'origin', 'main'], check=True)
        return HttpResponse("Successfully pulled latest changes", status=200)
    except Exception as e:
        return HttpResponse(f"Error: {e}", status=500)

### Github webhooks

import hmac
import hashlib
from django.conf import settings
from django.http import HttpResponseForbidden

@csrf_exempt
@require_POST
def github_webhook(request):
    # 1. Get the signature from headers
    signature = request.headers.get('X-Hub-Signature-256')
    if not signature:
        return HttpResponseForbidden("Signature missing.")

    # 2. Re-calculate the HMAC hash using our local secret
    sha_name, signature_hash = signature.split('=')
    if sha_name != 'sha256':
        return HttpResponseForbidden("Invalid hash algorithm.")

    mac = hmac.new(
        settings.GITHUB_WEBHOOK_SECRET.encode(),
        msg=request.body,
        digestmod=hashlib.sha256
    )

    # 3. Securely compare the hashes
    if not hmac.compare_digest(mac.hexdigest(), signature_hash):
        return HttpResponseForbidden("Signature mismatch.")

    # 4. If valid, proceed with the pull
    try:
        subprocess.run(['git', 'pull', 'origin', 'main'], check=True)
        return HttpResponse("Successfully pulled latest changes", status=200)
    except Exception as e:
        return HttpResponse(f"Error: {e}", status=500)