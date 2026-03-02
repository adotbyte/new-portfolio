import os
import datetime
from django.core.management.base import BaseCommand
from django.conf import settings
import chromadb
from bs4 import BeautifulSoup
from langchain_text_splitters import MarkdownTextSplitter

# Import the shared embedding function from your utils
from index.utils import gemini_ef, get_portfolio_collection

class Command(BaseCommand):
    help = 'Syncs ALL local knowledge (Blog, Profile, HTML) with the ChromaDB brain'

    def handle(self, *args, **options):
        # 1. Setup Client & Fresh Collection
        chroma_path = os.path.join(settings.BASE_DIR, "chroma_db")
        chroma_client = chromadb.PersistentClient(path=chroma_path)
        
        try:
            chroma_client.delete_collection("portfolio_data")
            self.stdout.write(self.style.WARNING("Deleted old collection for a fresh sync."))
        except: 
            pass

        collection = chroma_client.create_collection(
            name="portfolio_data", 
            embedding_function=gemini_ef 
        )

        total_chunks = 0
        splitter = MarkdownTextSplitter(chunk_size=1000, chunk_overlap=100)

        # --- STEP A: Index the Blog Folder (.md) ---
        blog_dir = os.path.join(settings.BASE_DIR, 'index', 'blog')
        if os.path.exists(blog_dir):
            for filename in os.listdir(blog_dir):
                if filename.endswith(".md"):
                    with open(os.path.join(blog_dir, filename), 'r', encoding='utf-8') as f:
                        chunks = splitter.split_text(f.read())
                        collection.add(
                            documents=chunks,
                            metadatas=[{"source": filename, "type": "blog"}] * len(chunks),
                            ids=[f"blog_{filename}_{i}" for i in range(len(chunks))]
                        )
                        total_chunks += len(chunks)
            self.stdout.write(f"✅ Blog Folder Sync: {total_chunks} chunks")

        # --- STEP B: Index about_me.md (Root) ---
        about_me_path = os.path.join(settings.BASE_DIR, "about_me.md")
        if os.path.exists(about_me_path):
            with open(about_me_path, 'r', encoding='utf-8') as f:
                content = f.read()
                collection.add(
                    documents=[content],
                    metadatas=[{"source": "about_me.md", "type": "profile"}],
                    ids=["root_profile_001"]
                )
                total_chunks += 1
            self.stdout.write("✅ Profile (about_me.md) Sync: 1 chunk")

        # --- STEP C: Index my_knowledge.html ---
        html_path = os.path.join(settings.BASE_DIR, "index", "templates", "my_knowledge.html")
        if os.path.exists(html_path):
            with open(html_path, "r", encoding="utf-8") as f:
                soup = BeautifulSoup(f.read(), "html.parser")
                # Strip scripts/styles for a cleaner brain
                for s in soup(["script", "style"]): s.decompose()
                clean_text = soup.get_text(separator=" ")
                collection.add(
                    documents=[clean_text],
                    metadatas=[{"source": "my_knowledge.html", "type": "knowledge"}],
                    ids=["knowledge_html_001"]
                )
                total_chunks += 1
            self.stdout.write("✅ HTML Knowledge Sync: 1 chunk")

        # --- STEP D: Save the Timestamp ---
        sync_file = os.path.join(settings.BASE_DIR, "brain_sync.txt")
        now_str = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        with open(sync_file, "w") as f:
            f.write(now_str)

        self.stdout.write(self.style.SUCCESS(f"\n✨ FULL SYNC COMPLETE: {total_chunks} chunks at {now_str}"))