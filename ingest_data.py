import os
import chromadb
import datetime
from bs4 import BeautifulSoup
from dotenv import load_dotenv
from google import genai
from google.genai import types
from chromadb import Documents, EmbeddingFunction, Embeddings
from langchain_text_splitters import MarkdownTextSplitter

# 1. LOAD ENVIRONMENT
load_dotenv()
API_KEY = os.getenv("GEMINI_API_KEY")

# ingest_data.py (Top part)

# 1. SETUP THE 2026 EMBEDDING FUNCTION
class GeminiEmbeddingFunction(EmbeddingFunction):
    def __init__(self, api_key):
        # We initialize a local client for the ingestion script
        self.client = genai.Client(api_key=api_key)
        self.__name__ = "GeminiEmbeddingFunction"

    def __call__(self, input: Documents) -> Embeddings:
        # Use RETRIEVAL_DOCUMENT for ingestion
        response = self.client.models.embed_content(
            model="models/gemini-embedding-001",
            contents=input,
            config=types.EmbedContentConfig(
                task_type="RETRIEVAL_DOCUMENT"
                # DO NOT add output_dimensionality here unless it's in utils.py too!
            )
        )
        return [e.values for e in response.embeddings]

# 2. INITIALIZE
gemini_ef = GeminiEmbeddingFunction(api_key=API_KEY)
DB_PATH = os.path.join(os.getcwd(), "chroma_db")
client = chromadb.PersistentClient(path=DB_PATH)

# Ensure the collection name and embedding function match utils.py EXACTLY
collection = client.get_or_create_collection(
    name="portfolio_data", 
    embedding_function=gemini_ef
)

# --- 4. CLEAN & INDEX FUNCTIONS ---

def reindex_clean_markdown(directory_path):
    """Indexes all .md files in the specified directory."""
    splitter = MarkdownTextSplitter(chunk_size=400, chunk_overlap=50)
    
    if not os.path.exists(directory_path):
        print(f"❌ Directory not found: {directory_path}")
        return

    for filename in os.listdir(directory_path):
        if filename.endswith(".md"):
            file_path = os.path.join(directory_path, filename)
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
                chunks = splitter.split_text(content)
                
                collection.add(
                    documents=chunks,
                    metadatas=[{"source": filename, "type": "markdown"}] * len(chunks),
                    ids=[f"{filename}_{i}" for i in range(len(chunks))]
                )
            print(f"✅ Indexed: {filename} ({len(chunks)} chunks)")

def force_index_raspberry(file_path):
    """Specifically forces the ingestion of the Raspberry Pi file."""
    if os.path.exists(file_path):
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
            
        collection.add(
            documents=[content],
            metadatas=[{"source": "raspberry-pi.md", "type": "markdown"}],
            ids=["raspberry_pi_manual_unique_01"]
        )
        print("🚀 SUCCESS: Raspberry Pi data injected manually!")
    else:
        print(f"❌ ERROR: File not found at {file_path}")

# --- 5. EXECUTION ---
if __name__ == "__main__":
    # --- PATH A: YOUR BLOG (Keep this as is) ---
    blog_path = os.path.join(os.getcwd(), "index", "blog")
    reindex_clean_markdown(blog_path)

    # --- PATH B: YOUR ROOT FOLDER (For about_me.md) ---
    # Since ingest_data.py is in the root, os.getcwd() is the right place
    root_path = os.getcwd() 
    about_me_file = os.path.join(root_path, "about_me.md")

    if os.path.exists(about_me_file):
        with open(about_me_file, 'r', encoding='utf-8') as f:
            content = f.read()
            
            # Split about_me into smaller chunks so 'Hardware' isn't lost in a big file
            about_splitter = MarkdownTextSplitter(chunk_size=300, chunk_overlap=30)
            about_chunks = about_splitter.split_text(content)
            
            collection.add(
                documents=about_chunks,
                metadatas=[{"source": "about_me.md", "keywords": "hardware, raspberry pi, engineering"}] * len(about_chunks),
                ids=[f"about_me_chunk_{i}" for i in range(len(about_chunks))]
            )
        print("✅ Success: about_me.md ingested with hardware keywords!")
    else:
        print(f"❌ Error: Could not find about_me.md at {about_me_file}")

# --- PATH C: YOUR KNOWLEDGE HTML ---
    html_path = os.path.join(os.getcwd(), "index", "templates", "my_knowledge.html")
    if os.path.exists(html_path):
        with open(html_path, "r", encoding="utf-8") as f:
            html_raw = f.read()
            
            # 1. REMOVE DJANGO TAGS FIRST
            import re
            clean_html = re.sub(r'\{%.*?%\}', '', html_raw)
            clean_html = re.sub(r'\{\{.*?\}\}', '', clean_html)
            
            # 2. NOW USE SOUP
            soup = BeautifulSoup(clean_html, "html.parser")
            text = soup.get_text(separator=" ").strip()
            
            # 3. ONLY ADD IF NOT EMPTY
            if text:
                collection.add(
                    documents=[text],
                    metadatas=[{"source": "my_knowledge.html", "type": "knowledge"}],
                    ids=["knowledge_html_001"]
                )
                print("✅ Success: Cleaned my_knowledge.html ingested!")

    print(f"\n✨ Total items in brain now: {collection.count()}")

    # At the very end of ingest_data.py (inside the if __name__ == "__main__": block)
    
    # Save the current date to brain_sync.txt
    sync_file_path = os.path.join(os.getcwd(), "brain_sync.txt")
    with open(sync_file_path, "w") as f:
        f.write(datetime.datetime.now().strftime("%Y-%m-%d %H:%M"))
    
    print(f"✅ brain_sync.txt updated!")
    print(f"\n✨ Total items in brain now: {collection.count()}")