import os
import json
from django.apps import AppConfig

class IndexConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'index'

 # index/apps.py
# index/apps.py
def ready(self):
    if os.environ.get('RUN_MAIN') == 'true':
        # 1. Scrape HTML and Overwrite JSON
        from .utils import update_json_from_html
        update_json_from_html()
        
        # 2. Sync that JSON to the Database
        self.sync_achievements()

    def sync_json_to_db(self):
        # Import model here to avoid AppRegistryNotReady error
        from .models import ChatHistory 
        
        json_path = os.path.join(os.getcwd(), 'index', 'static', 'resume_data.json')

        if os.path.exists(json_path):
            try:
                with open(json_path, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    
                    for item in data:
                        # 'update_or_create' is the key to fixing "old information"
                        # It finds the entry by title and updates the content
                        obj, created = ChatHistory.objects.update_or_create(
                            title=item.get('title'), 
                            defaults={'content': item.get('content')}
                        )
                print(f"--- Chatbot Knowledge Updated from JSON ---")
            except Exception as e:
                print(f"Error loading JSON: {e}")
        else:
            print("JSON file not found.")

from django.apps import AppConfig

class CvConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'CV'  # <--- Must match the folder name exactly
