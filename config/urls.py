import os
from django.contrib import admin
from django.urls import path, include, re_path  # Added path and include back here
from django.conf import settings
from django.views.static import serve

# This ensures Django knows where your files are
BASE_DIR = settings.BASE_DIR

urlpatterns = [
    # 1. Admin and API (Keep these at the top)
    path('admin/', admin.site.urls),
    path('api/email/', include('sendemail.urls')), 

    # 2. THE ASSETS BRIDGE
    # This solves the 404 and MIME error by finding the files before the React catch-all
    re_path(r'^assets/(?P<path>.*)$', serve, {
        'document_root': os.path.join(BASE_DIR, 'frontend', 'dist', 'assets'),
    }),
    
    # Static files like favicons or manifests that Vite puts in dist root
    re_path(r'^static/(?P<path>.*)$', serve, {
        'document_root': os.path.join(BASE_DIR, 'frontend', 'dist'),
    }),

    # Add this above the index.urls path
    re_path(r'^(?P<path>.*(?:webmanifest|ico|png|svg))$', serve, {
        'document_root': os.path.join(BASE_DIR, 'frontend', 'dist'),
    }),

    re_path(r'^assets/(?P<path>.*)$', serve, {
        'document_root': '/home/audrius/Desktop/portfolio/frontend/dist/assets',
    }),

    # 3. REACT CATCH-ALL (Must be last)
    path('', include('index.urls')),               
]