from django.db import models
from django.conf import settings

# Chat message

class ChatMessage(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, null=True, blank=True)
    session_key = models.CharField(max_length=40, null=True, blank=True, db_index=True)
    user_message = models.TextField()
    bot_response = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Chat with {self.user} at {self.timestamp}"
    
# History

from django.db import models

class ChatHistory(models.Model):
    # This stores a unique ID for the browser session
    session_id = models.CharField(max_length=255, null=True, blank=True, db_index=True)
    role = models.CharField(max_length=10) # 'user' or 'model'
    message = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['timestamp']

from django.db import models
from pgvector.django import VectorField

class ResumePoint(models.Model):
    text = models.TextField()
    # 768 dimensions is standard for Gemini text-embedding-004
    embedding = VectorField(dimensions=3072) 

    def __str__(self):
        return self.text[:50]