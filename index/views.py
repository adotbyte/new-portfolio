import json
import os
import subprocess
import markdown2
import hmac
import hashlib
from django.shortcuts import render
from django.http import JsonResponse, HttpResponse, Http404, HttpResponseForbidden, StreamingHttpResponse
from django.conf import settings
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST
from django import db # Added to handle connection closing

# AI & RAG Imports
from google import genai
from google.genai import types
import chromadb
from chromadb import Documents, EmbeddingFunction, Embeddings

# IMPORT YOUR MODELS
from .models import ChatHistory 

# --- 1. INITIALIZATION ---
client = genai.Client(api_key=settings.GEMINI_API_KEY)

class GeminiEmbeddingFunction(EmbeddingFunction):
    def __init__(self, gemini_client):
        self.client = gemini_client
        self.__name__ = "GeminiEmbeddingFunction"

    def __call__(self, input: Documents) -> Embeddings:
        response = self.client.models.embed_content(
            model="models/gemini-embedding-001",
            contents=input,
            config=types.EmbedContentConfig(
                task_type="RETRIEVAL_DOCUMENT",
                output_dimensionality=3072
            )
        )
        return [e.values for e in response.embeddings]

gemini_ef = GeminiEmbeddingFunction(client)
chroma_path = os.path.join(settings.BASE_DIR, "chroma_db")
chroma_client = chromadb.PersistentClient(path=chroma_path)

# Prevent SQLite Locks
try:
    import sqlite3
    db_file = os.path.join(chroma_path, "chroma.sqlite3")
    if os.path.exists(db_file):
        conn = sqlite3.connect(db_file)
        conn.execute("PRAGMA journal_mode=WAL;")
        conn.close()
except Exception as e:
    print(f"WAL Mode failed: {e}")

collection = chroma_client.get_or_create_collection(
    name="portfolio_data", 
    embedding_function=gemini_ef
)

# --- 2. HELPERS ---
def ensure_session(request):
    if not request.session.session_key:
        request.session.create()
    request.session['active'] = True
    request.session.save() # Crucial: Write to DB immediately
    return request.session.session_key

# --- 3. VIEWS ---

def index(request):
    session_id = ensure_session(request)
    history = ChatHistory.objects.filter(session_id=session_id).order_by('timestamp')
    return render(request, 'index.html', {'history': history})

@csrf_exempt
@require_POST
def chat_with_gemini(request):
    try:
        session_id = ensure_session(request)
        body = json.loads(request.body)
        user_query = body.get('message', '')

        # 1. Save User Message
        ChatHistory.objects.create(session_id=session_id, role='user', message=user_query)

        # 2. RAG Retrieval - INCREASED SENSITIVITY
        # We grab 15 results to make sure we don't miss the 'Projects' section
        results = collection.query(query_texts=[user_query], n_results=15)
        
        # Join documents with more space to keep sections distinct
        context_text = "\n\n---\n\n".join(results['documents'][0]) if results['documents'] else ""

        # 3. AI Generation
        sys_instr = (
            "You are AdotByte, the official professional AI assistant for Audrius's portfolio. "
            "Your task is to provide detailed information about Audrius's projects, experience, and skills. "
            "Use the context below. If you see a section about 'Projects', list them clearly.\n\n"
            f"CONTEXT FROM DATA:\n{context_text}"
        )

        response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=user_query,
            config=types.GenerateContentConfig(system_instruction=sys_instr)
        )
        
        ai_text = response.text

        # 4. Save and Return
        formatted_ai_text = markdown2.markdown(ai_text, extras=['fenced-code-blocks', 'tables'])
        ChatHistory.objects.create(session_id=session_id, role='assistant', message=formatted_ai_text)

        return JsonResponse({'text': formatted_ai_text})

    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

# (Remaining views like about_me_view, blog_index, etc., stay exactly as they were)
def about_me_view(request):
    file_path = os.path.join(settings.BASE_DIR, 'about_me.md')
    html_content = "<p>Content coming soon!</p>"
    if os.path.exists(file_path):
        with open(file_path, 'r', encoding='utf-8') as f:
            html_content = markdown2.markdown(f.read(), extras=['fenced-code-blocks', 'tables'])
    return render(request, 'about_me.html', {'about_content': html_content})

def my_knowledge(request):
    return render(request, 'my_knowledge.html')

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