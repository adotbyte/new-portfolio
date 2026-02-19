from django.urls import path
from . import views

urlpatterns = [
    # 1. Main Pages
    # The root now uses the index view that loads ChatHistory
    path('', views.about_me_view, name='index'), 
    path('about_me/', views.about_me_view, name='about_me'),
    path('my_knowledge/', views.my_knowledge, name='my_knowledge'),

    # 2. AI Chat Endpoints
    # This MUST match the fetch URL in your JavaScript
    path('chat_with_gemini/api/', views.chat_with_gemini, name='chat_with_gemini'),
    path('chat/clear/', views.delete_chat_history, name='delete_chat_history'),

    # 3. Blog System
    path('blog/', views.blog_index, name='blog_index'),
    path('blog/<slug:slug>/', views.blog_post_detail, name='blog_post_detail'),
    
    # 4. Utilities
    path('update-server/', views.github_webhook, name='webhook'),
]