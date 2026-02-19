import os
import chromadb
from chromadb.utils import embedding_functions
from bs4 import BeautifulSoup
from dotenv import load_dotenv

from chromadb import Documents, EmbeddingFunction, Embeddings
from google.genai import types

class GeminiEmbeddingFunction(EmbeddingFunction):
    def __init__(self, client, model_name="models/gemini-embedding-001"):
        self.client = client
        self.model_name = model_name

    def __call__(self, input: Documents) -> Embeddings:
        # 1. Get the complex response from Google
        response = self.client.models.embed_content(
            model=self.model_name,
            contents=input,
            config=types.EmbedContentConfig(task_type="RETRIEVAL_DOCUMENT")
        )
        
        # 2. Extract just the raw 'values' (the list of floats)
        # We use a list comprehension because 'input' could be multiple chunks
        return [e.values for e in response.embeddings] # <--- THIS IS THE KEY FIX

# 1. Load environment variables from the same folder
load_dotenv()

# 2. Setup ChromaDB (Saves to 'chroma_db' folder in root)
DB_PATH = os.path.join(os.getcwd(), "chroma_db")
client = chromadb.PersistentClient(path=DB_PATH)

# 3. Setup the Embedding Function
gemini_ef = embedding_functions.GoogleGenerativeAiEmbeddingFunction(
    api_key=os.getenv("GEMINI_API_KEY"),
    model_name="models/gemini-embedding-001"
)

def ingest_knowledge():
    # Since we are in root, the path to your template is:
    html_path = "index/templates/my_knowledge.html"
    
    if not os.path.exists(html_path):
        print(f"❌ Error: {html_path} not found. Check your folder structure!")
        return

    with open(html_path, "r", encoding="utf-8") as f:
        soup = BeautifulSoup(f.read(), "html.parser")
        text = soup.get_text(separator="\n")

    # Split into chunks (paragraphs)
    chunks = [c.strip() for c in text.split("\n\n") if len(c.strip()) > 20]
    
    # Create the collection
    collection = client.get_or_create_collection(
        name="portfolio_data", 
        embedding_function=gemini_ef
    )

    # Add data
    collection.add(
        documents=chunks,
        ids=[f"id_{i}" for i in range(len(chunks))],
        metadatas=[{"source": "resume"} for _ in chunks]
    )
    print(f"✅ Success! Ingested {len(chunks)} chunks into {DB_PATH}")

if __name__ == "__main__":
    ingest_knowledge()