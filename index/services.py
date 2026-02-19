# myapp/services.py
'''import os
from google import genai
from django.conf import settings

class GeminiService:
    def __init__(self):
        # Initialize the client with Paid Tier requirements
        self.client = genai.Client(
            api_key=os.getenv("GEMINI_API_KEY"),
            #project=os.getenv("GOOGLE_CLOUD_PROJECT"),
            location="europe-central2" # Or your specific region
        )

    def generate_text(self, prompt):
        try:
            # Use the specific model you have quota for
            response = self.client.models.generate_content(
                model="gemini-2.5-flash-lite", 
                contents=prompt
            )
            return response.text
        except Exception as e:
            # Handle specific API errors here
            print(f"Gemini API Error: {e}")
            return None'''

# myapp/services.py
from django.conf import settings
import os
from google import genai

class GeminiService:
    def __init__(self):
        key = settings.GEMINI_API_KEY
        
        # This will print to your terminal when you refresh the page
        print(f"DEBUG: My API Key starts with: {key[:10]}... and ends with: {key[-4:]}")
        print(f"DEBUG: Key length: {len(key)}")

        self.client = genai.Client(api_key=key)