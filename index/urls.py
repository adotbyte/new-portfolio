from django.urls import path, re_path
from django.contrib.sitemaps.views import sitemap
from django.views.generic.base import RedirectView
from django.templatetags.static import static
from django.views.generic import TemplateView
from django.conf import settings
from django.conf.urls.static import static as static_url
from django.views.decorators.csrf import ensure_csrf_cookie
from . import views 
from index.sitemaps import StaticViewSitemap, ProjectSitemap
from sendemail import views as email_views

sitemaps = {
    'static': StaticViewSitemap,
    'projects': ProjectSitemap,
}

urlpatterns = [
    # 1. API Paths (Must be unique)
    path('api/chat/', views.chat_api, name='chat_api'),
    path('api/delete-chat-history/', views.delete_chat_history, name='delete_chat_history'),
    path('api/about_me/', views.about_me_api, name='about_me_api'), # <--- FIXED PATH
    path('api/contact/', email_views.contact_api, name='contact_api'),
    path('api/projects/', views.project_list_api, name='project-api'),
    
    # 2. SEO & Assets
    path('sitemap.xml', sitemap, {'sitemaps': sitemaps}, name='django.contrib.sitemaps.views.sitemap'),
    path('robots.txt', RedirectView.as_view(url=static('robots.txt')), name='robots_file'),
    path('site.webmanifest', RedirectView.as_view(url=static('site.webmanifest'))),

    # 3. Blog
    path('blog/', views.blog_index, name='blog_index'),
    path('blog/<slug:slug>/', views.blog_post_detail, name='blog_post_detail'),

    # 4. THE CATCH-ALL (ONLY ONE ENTRY)
    # We only need one re_path. ensure_csrf_cookie makes sure React gets the token.
    re_path(r'^.*$', views.index, name='index'),
]