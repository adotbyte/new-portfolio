from django.urls import path
from . import views # This covers everything in views.py
from django.contrib.sitemaps.views import sitemap
from index.sitemaps import StaticViewSitemap, ProjectSitemap
from django.views.generic.base import RedirectView
from django.templatetags.static import static

sitemaps = {
    'static': StaticViewSitemap,
    'projects': ProjectSitemap,
}

urlpatterns = [
    # 1. The Home Page
    path('', views.about_me_view, name='index'), 

    # 2. Specific pages
    path('about_me/', views.about_me_view, name='about_me'),
    path('my_knowledge/', views.my_knowledge, name='my_knowledge'),
    path('privacy/', views.privacy, name='privacy'), # Clean /privacy/ URL
    
    # 3. Functional/API paths
    path('chat_with_gemini/api/', views.chat_with_gemini, name='chat_with_gemini'),
    path('chat/clear/', views.delete_chat_history, name='delete_chat_history'),
    
    # 4. Blog
    path('blog/', views.blog_index, name='blog_index'),
    path('blog/<slug:slug>/', views.blog_post_detail, name='blog_post_detail'),
    
    # 5. SEO files
    path('sitemap.xml', sitemap, {'sitemaps': sitemaps}, 
         name='django.contrib.sitemaps.views.sitemap'),
    path('robots.txt', RedirectView.as_view(url=static('robots.txt')), name='robots_file'),
]