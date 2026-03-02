from django.urls import path
from . import views
from django.views.generic import TemplateView

urlpatterns = [
    # 1. The Home Page should point to index (where last_sync and chat history live)
    path('', views.about_me_view, name='index'), 

    # 2. Your specific About Me page (don't give it the name 'index')
    path('about_me/', views.about_me_view, name='about_me'),
    
    # 3. Everything else stays the same
    path('my_knowledge/', views.my_knowledge, name='my_knowledge'),
    path('chat_with_gemini/api/', views.chat_with_gemini, name='chat_with_gemini'),
    path('chat/clear/', views.delete_chat_history, name='delete_chat_history'),
    path('blog/', views.blog_index, name='blog_index'),
    path('blog/<slug:slug>/', views.blog_post_detail, name='blog_post_detail'),
]