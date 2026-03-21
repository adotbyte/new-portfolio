# index/utils.py
import os
from django.conf import settings
from google import genai
from google.genai import types
import chromadb
from chromadb import EmbeddingFunction, Documents, Embeddings

# 1. Initialize the 2026 Client
# 1. Initialize the global GenAI Client
# This client must be passed into the EmbeddingFunction
ai_client = genai.Client(api_key=settings.GEMINI_API_KEY)

# 2. Define the Function Class correctly
class GeminiEmbeddingFunction(EmbeddingFunction):
    def __init__(self, client_instance):
        # This line was likely missing or misspelled in your version!
        self.client = client_instance 
        self.__name__ = "GeminiEmbeddingFunction"

    def __call__(self, input: Documents) -> Embeddings:
        # Determine task type based on input size
        task = "RETRIEVAL_QUERY" if len(input) == 1 and len(input[0]) < 250 else "RETRIEVAL_DOCUMENT"
        
        response = self.client.models.embed_content(
            model="models/gemini-embedding-001",
            contents=input,
            config=types.EmbedContentConfig(
                task_type=task
            )
        )
        return [e.values for e in response.embeddings]

# 3. Create the global instance using the ai_client defined above
gemini_ef = GeminiEmbeddingFunction(ai_client)

def get_portfolio_collection():
    chroma_path = os.path.join(settings.BASE_DIR, "chroma_db")
    chroma_client = chromadb.PersistentClient(path=chroma_path)
    
    return chroma_client.get_or_create_collection(
        name="portfolio_data", 
        embedding_function=gemini_ef
    )


def ensure_session(request):
    if not request.session.session_key:
        request.session.create()
    request.session['active'] = True
    request.session.save()
    return request.session.session_key