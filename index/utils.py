# index/utils.py
import os
from django.conf import settings
from google import genai
from google.genai import types
import chromadb
from chromadb import EmbeddingFunction, Documents, Embeddings

# 1. Initialize the 2026 Client
# Using the new genai.Client for Gemini 2.0/3.0
client = genai.Client(api_key=settings.GEMINI_API_KEY)

# 2. Define the Function Class for ChromaDB
class GeminiEmbeddingFunction(EmbeddingFunction):
    def __init__(self, gemini_client):
        self.client = gemini_client
        self.__name__ = "GeminiEmbeddingFunction"

    def __call__(self, input: Documents) -> Embeddings:
        # Convert text chunks into 3072-dimensional vectors
        response = self.client.models.embed_content(
            model="models/gemini-embedding-001",
            contents=input,
            config=types.EmbedContentConfig(
                task_type="RETRIEVAL_DOCUMENT",
                output_dimensionality=3072
            )
        )
        return [e.values for e in response.embeddings]

# 3. Create the global instance
gemini_ef = GeminiEmbeddingFunction(client)

# 4. Helper to get the collection consistently
# This ensures both views.py and sync_brain.py use the same database logic
def get_portfolio_collection():
    chroma_path = os.path.join(settings.BASE_DIR, "chroma_db")
    
    # PersistentClient keeps the data saved even if the server restarts
    chroma_client = chromadb.PersistentClient(path=chroma_path)
    
    return chroma_client.get_or_create_collection(
        name="portfolio_data", 
        embedding_function=gemini_ef
    )

# index/utils.py

def ensure_session(request):
    """Ensures the user has a session and returns the session_key."""
    if not request.session.session_key:
        request.session.create()
    request.session['active'] = True
    request.session.save()
    return request.session.session_key