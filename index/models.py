from django.db import models
from django.conf import settings
from django.urls import reverse
from pgvector.django import VectorField

# --- CHAT MODELS ---

class ChatMessage(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, null=True, blank=True)
    session_key = models.CharField(max_length=40, null=True, blank=True, db_index=True)
    user_message = models.TextField()
    bot_response = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Chat with {self.user} at {self.timestamp}"

class ChatHistory(models.Model):
    session_id = models.CharField(max_length=255, null=True, blank=True, db_index=True)
    role = models.CharField(max_length=10) # 'user' or 'model'
    message = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['timestamp']

# --- VECTOR STORAGE ---

class ResumePoint(models.Model):
    text = models.TextField()
    embedding = VectorField(dimensions=3072) 

    def __str__(self):
        return self.text[:50]

# --- PORTFOLIO PROJECT (MERGED) ---

class Project(models.Model):
    title = models.CharField(max_length=200)
    # Added slug back in, but made it blank=True so it doesn't break if you don't provide one
    slug = models.SlugField(unique=True, blank=True, null=True) 
    description = models.TextField()
    tech_stack = models.CharField(max_length=200, help_text="Comma separated: Django, React, etc.")
    server_highlights = models.TextField()
    link = models.URLField(blank=True)
    order = models.IntegerField(default=0)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return self.title

    def get_absolute_url(self):
        return reverse('project_detail', args=[self.slug])