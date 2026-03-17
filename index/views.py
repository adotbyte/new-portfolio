import json
import os
import subprocess
import markdown2
import re
import traceback
import chromadb

from django.shortcuts import render
from django.http import JsonResponse, HttpResponse, Http404
from django.conf import settings
#from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST
from django.views.decorators.csrf import ensure_csrf_cookie

# New Gemini SDK for 2026
from google import genai
from google.genai import types

# 1. Paste the Custom Class here so Django knows how to 'translate'
class GeminiEmbeddingFunction(chromadb.EmbeddingFunction):
    def __init__(self, api_key):
        self.client = genai.Client(api_key=api_key)
        self.__name__ = "GeminiEmbeddingFunction"

    def __call__(self, input: chromadb.Documents) -> chromadb.Embeddings:
        # This MUST produce a dimension of 3072
        response = self.client.models.embed_content(
            model="models/gemini-embedding-001",
            contents=input,
            config=types.EmbedContentConfig(task_type="RETRIEVAL_QUERY")
        )
        return [e.values for e in response.embeddings]

# Initialize it
gemini_ef = GeminiEmbeddingFunction(api_key=os.getenv("GEMINI_API_KEY"))

# Connect
db_path = os.path.join(settings.BASE_DIR, "chroma_db")
db = chromadb.PersistentClient(path=db_path)

# GET the existing collection
collection = db.get_collection(
    name="portfolio_data", 
    embedding_function=gemini_ef
)

# --- 1. INITIALIZATION ---

# Replace with your actual API key
# 1. Get the secret key from your .env file
GEMINI_KEY = os.environ.get("GEMINI_API_KEY")

# 2. Give that key to the Gemini Client
client = genai.Client(api_key=GEMINI_KEY)

# Connect to your existing ChromaDB
# Uses the path consistent with your old ingestion scripts
db_path = os.path.join(settings.BASE_DIR, "chroma_db")
db = chromadb.PersistentClient(path=db_path)
collection = db.get_or_create_collection("portfolio_data")

# --- 2. HELPERS & TOOLS ---

def clean_django_tags(text):
    """Removes {% ... %} and {{ ... }} tags from the database text."""
    text = re.sub(r'\{%.*?%\}', '', text)
    text = re.sub(r'\{\{.*?\}\}', '', text)
    return re.sub(r'\s+', ' ', text).strip()

def search_resume(query: str) -> str:
    print(f"🔍 AI is searching for: {query}")
    try:
        # CORRECT SYNTAX for Google GenAI SDK 2.0+
        result = client.models.embed_content(
            model="gemini-embedding-001",
            contents=query  # Use 'contents' (plural) instead of 'content'
        )
        
        # Extract the values from the result object
        query_embedding = result.embeddings[0].values
        
        # Pass the embedding to ChromaDB
        results = collection.query(
            query_embeddings=[query_embedding],
            n_results=5
        )
        
        if results['documents'] and results['documents'][0]:
                    return "\n\n---\n\n".join(results['documents'][0])
                
    except Exception as e:
        print(f"❌ Search Error: {e}")
        
    return "No specific data found."

# Define the Agentic Tool
resume_tool = types.Tool(
    function_declarations=[
        types.FunctionDeclaration(
            name="search_resume",
            description="Search the resume database for specific technical details and experience.",
            parameters={
                "type": "OBJECT",
                "properties": {"query": {"type": "STRING"}},
                "required": ["query"]
            }
        )
    ]
)

@ensure_csrf_cookie
@require_POST
def chat_api(request):
    # 1. INITIALIZE variables at the very top
    raw_content = ""
    
    try:
        body = json.loads(request.body)
        user_query = body.get('message', '').strip()

        if not user_query:
            return JsonResponse({'error': 'Empty message'}, status=400)

        # 2. START THE CHAT
        # Note: I used 'gemini-2.0-flash' as 2.5-flash-lite might not be out yet!
        chat = client.chats.create(
            model="gemini-2.5-flash-lite", 
            config=types.GenerateContentConfig(
                tools=[resume_tool],
                system_instruction="You are AdotByte, Audrius's expert digital agent. Your goal is to provide specific, fact-based answers about Audrius's technical skills, Raspberry Pi 5 setup, and engineering projects. ALWAYS use the search_resume tool first before answering questions about his experience or skills. If the search returns results, summarize them professionally for a recruiter. If no results are found, politely explain you only have access to his technical portfolio."
            )
        )

        # 3. SEND INITIAL MESSAGE
        response = chat.send_message(user_query)

        # 4. HANDLE THE TOOL LOOP
        # Check if Gemini wants to call the search function
        if response.candidates[0].content.parts and response.candidates[0].content.parts[0].function_call:
            call = response.candidates[0].content.parts[0].function_call
            
            # Run your search function
            query_text = call.args.get("query", user_query)
            result_data = search_resume(query_text)
            
            # Send result back to Gemini for the final summary
            final_response = chat.send_message(
                types.Part.from_function_response(
                    name=call.name,
                    response={'result': str(result_data)}
                )
            )
            
            # Get the text from the summary
            raw_content = final_response.text if final_response.text else "I found data but couldn't summarize it."
        else:
            # Normal chat (no search needed)
            raw_content = response.text if response.text else "I'm not sure how to answer that."

        # 5. FORMAT AND RETURN
        html_content = markdown2.markdown(raw_content, extras=['fenced-code-blocks', 'tables'])
        return JsonResponse({'content': html_content})

    except Exception as e:
        print(traceback.format_exc())
        return JsonResponse({'content': f"AI Brain Fog: {str(e)}"}, status=500)

# --- 4. LEGACY NAVIGATION & BLOG VIEWS ---

from django.middleware.csrf import get_token

def index(request):
    # Debug: This will show up in your CMD/Terminal when you refresh the page
    print(f"DEBUG: Turnstile Key is {settings.TURNSTILE_SITE_KEY}")
    
    context = {
        'TURNSTILE_SITE_KEY': settings.TURNSTILE_SITE_KEY,
    }
    response = render(request, 'index.html', context)
    
    # Keep your CSRF cookie logic
    response.set_cookie('csrftoken', get_token(request), httponly=False, samesite='Lax')
    return response

def about_me_view(request):
    """Specialized About Me Page using local markdown file."""
    file_path = os.path.join(settings.BASE_DIR, 'about_me.md')
    html_content = "<p>Content coming soon!</p>"
    if os.path.exists(file_path):
        with open(file_path, 'r', encoding='utf-8') as f:
            html_content = markdown2.markdown(f.read(), extras=['fenced-code-blocks', 'tables'])
    return render(request, 'about_me.html', {'about_content': html_content})

def my_knowledge(request):
    return render(request, 'my_knowledge.html')

def privacy(request):
    return render(request, 'privacy.html')

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

@ensure_csrf_cookie
@require_POST
def github_webhook(request):
    """Auto-update code from GitHub."""
    try:
        subprocess.run(['git', 'pull', 'origin', 'main'], check=True)
        return HttpResponse("OK")
    except Exception as e:
        return HttpResponse(str(e), status=500)

### Delete chat history

@ensure_csrf_cookie
@require_POST
def delete_chat_history(request):
    """Clears history for the current session"""
    session_id = request.session.session_key
    if session_id:
        ChatHistory.objects.filter(session_id=session_id).delete()
        return JsonResponse({"status": "success"})
    return JsonResponse({"status": "error"}, status=400)


def serve_chatbot(request):
    """
    Serves the main React application.
    Make sure you have run 'npm run build' in your React folder.
    """
    return render(request, 'chat.html')

@ensure_csrf_cookie
def delete_cookies(request):
    if request.method == "POST":
        # 1. Clear any session data if you use it
        request.session.flush()
        
        # 2. RETURN SUCCESS JSON (This stops the "Unexpected token <" error)
        return JsonResponse({"status": "success", "message": "Everything wiped!"})
    
    return JsonResponse({"status": "error", "message": "Invalid request"}, status=400)

### about_me.md

import os
from django.conf import settings
from django.http import JsonResponse

def about_me_api(request):
    # This points to the root directory (where manage.py usually lives)
    file_path = os.path.join(settings.BASE_DIR, 'about_me.md')
    
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        return JsonResponse({'content': content})
    except FileNotFoundError:
        return JsonResponse({'content': '# Error\nFile not found at root.'}, status=404)

from django.http import JsonResponse
from .models import Project

def project_list_api(request):
    projects = Project.objects.all()
    data = []
    for p in projects:
        data.append({
            "title": p.title,
            "description": p.description,
            "tech": [t.strip() for t in p.tech_stack.split(',')], # Turns string to list
            "serverHighlights": p.server_highlights,
            "link": p.link,
        })
    return JsonResponse(data, safe=False)

