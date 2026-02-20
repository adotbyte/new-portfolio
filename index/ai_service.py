import os
import json
import glob
from google import genai
from google.genai import types
from django.conf import settings

class AudriusAIService:
    def __init__(self):
        # Securely get API key from Django settings or Environment
        self.api_key = getattr(settings, "GEMINI_API_KEY", os.getenv("GEMINI_API_KEY"))
        self.client = genai.Client(api_key=self.api_key)
        self.model_id = "gemini-2.0-flash"
        self.cache_min_tokens = 4096

    def get_context(self):
        """Gathers data from index, templates, static folders."""
        # Join with your project's BASE_DIR
        base = settings.BASE_DIR
        folders = [os.path.join(base, f) for f in ['index', 'templates', 'static']]
        
        combined_md = "# KNOWLEDGE BASE\n\n"
        for folder in folders:
            if not os.path.exists(folder): continue
            for file_path in glob.glob(os.path.join(folder, '*.json')):
                try:
                    with open(file_path, 'r', encoding='utf-8') as f:
                        data = json.load(f)
                        combined_md += f"## SOURCE: {os.path.basename(file_path)}\n"
                        combined_md += f"{json.dumps(data)}\n---\n"
                except Exception: continue
        return combined_md

    def ask(self, question):
        context_text = self.get_context()
        token_count = self.client.models.count_tokens(model=self.model_id, contents=context_text).total_tokens
        sys_inst = "You are an AI for Audrius's website. Answer based on context only."

        if token_count >= self.cache_min_tokens:
            # CACHE LOGIC
            temp_cache = self.client.caches.create(
                model=self.model_id,
                config=types.CreateCachedContentConfig(
                    display_name="audrius_cache",
                    system_instruction=sys_inst,
                    contents=[context_text],
                    ttl="600s", # 10 mins
                )
            )
            response = self.client.models.generate_content(
                model=self.model_id,
                contents=question,
                config=types.GenerateContentConfig(cached_content=temp_cache.name)
            )
        else:
            # STANDARD PROMPT LOGIC
            response = self.client.models.generate_content(
                model=self.model_id,
                config=types.GenerateContentConfig(system_instruction=f"{sys_inst}\n\nContext: {context_text}"),
                contents=question
            )
        return response.text