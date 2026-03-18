"""
Django settings for CV project.
Consolidated and cleaned - 2026
"""

from pathlib import Path
import os
import environ

# 1. BASE DIRECTORIES & ENV LOADING
BASE_DIR = Path(__file__).resolve().parent.parent
CHROMA_DB_PATH = os.path.join(BASE_DIR, "chroma_db")

env = environ.Env(
    DEBUG=(bool, False),
    EMAIL_PORT=(int, 587),
    EMAIL_USE_TLS=(bool, True)
)
environ.Env.read_env(os.path.join(BASE_DIR, ".env"))

# 2. CORE SETTINGS
SECRET_KEY = env('SECRET_KEY')
DEBUG = env.bool('DEBUG', default=False)
ALLOWED_HOSTS = env.list('ALLOWED_HOSTS', default=['*'])

# Gemini / Third Party Keys
GEMINI_API_KEY = env('GEMINI_API_KEY')
FB_APP_ID = env('FB_APP_ID', default='')
TURNSTILE_SITE_KEY = env('VITE_TURNSTILE_SITE_KEY', default='')
TURNSTILE_SECRET_KEY = env('TURNSTILE_SECRET_KEY', default='')

# 3. APPLICATION DEFINITION
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'django.contrib.sitemaps',
    'django.contrib.sites',
    'corsheaders',
    'index',
    'sendemail',
    'turnstile',
    'crispy_forms',
    'crispy_bootstrap5',
    'config',  
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware', 
    'django.contrib.sessions.middleware.SessionMiddleware', 
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware', 
    'csp.middleware.CSPMiddleware',
    'config.middleware.SecurityHeadersMiddleware',
    'django.middleware.gzip.GZipMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'config.urls'
WSGI_APPLICATION = 'config.wsgi.application'
SITE_ID = 1

# 4. TEMPLATES
TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [
            os.path.join(BASE_DIR, 'frontend', 'dist'),
            os.path.join(BASE_DIR, "templates"),
        ],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
                'index.context_processors.chat_history_processor',
                'index.context_processors.sync_info',
                'index.context_processors.fb_settings',
            ],
        },
    },
]

# 5. DATABASE & AUTH
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

# 6. INTERNATIONALIZATION
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'Europe/Vilnius'
USE_I18N = True
USE_TZ = True

# 7. STATIC FILES
STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / "staticfiles"
STATICFILES_DIRS = [os.path.join(BASE_DIR, 'frontend', 'dist')]
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

# 8. SECURITY & COOKIES (The most important fix)
CORS_ALLOW_ALL_ORIGINS = True
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
USE_X_FORWARDED_HOST = True
USE_X_FORWARDED_PORT = True

CSRF_TRUSTED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:8000",
    "http://127.0.0.1:8000",
    "https://morkunas.info",
    "https://www.morkunas.info",
]

if not DEBUG:
    # Production
    CSRF_COOKIE_NAME = "__Secure-csrftoken"
    SESSION_COOKIE_NAME = "__Secure-sessionid"
    CSRF_COOKIE_SECURE = True
    SESSION_COOKIE_SECURE = True
    SECURE_SSL_REDIRECT = False
    SECURE_HSTS_SECONDS = 15552000 
    SECURE_HSTS_INCLUDE_SUBDOMAINS = True
    SECURE_HSTS_PRELOAD = True
else:
    # Development
    CSRF_COOKIE_NAME = "csrftoken"
    SESSION_COOKIE_NAME = "sessionid"
    CSRF_COOKIE_SECURE = False
    SESSION_COOKIE_SECURE = False
    SECURE_SSL_REDIRECT = False

# Required for React to read the CSRF cookie
CSRF_COOKIE_HTTPONLY = False 
SESSION_COOKIE_HTTPONLY = False
CSRF_USE_SESSIONS = False  
SESSION_COOKIE_SAMESITE = 'Lax'
CSRF_COOKIE_SAMESITE = 'Lax'
X_FRAME_OPTIONS = 'DENY'

# 9. CSP SETTINGS (Turnstile & Tailwind friendly)
CSP_DEFAULT_SRC = ("'self'", "https://morkunas.info", "https://www.morkunas.info")
CSP_SCRIPT_SRC = (
    "'self'", "https://cdn.jsdelivr.net", "https://cdn.tailwindcss.com",
    "https://challenges.cloudflare.com", "https://cdnjs.cloudflare.com", 
    "'unsafe-inline'", "'unsafe-eval'"
)
CSP_STYLE_SRC = (
    "'self'", "https://cdn.jsdelivr.net", "https://fonts.googleapis.com",
    "https://cdn.tailwindcss.com", "'unsafe-inline'"
)
CSP_FRAME_SRC = ("'self'", "https://challenges.cloudflare.com")
CSP_CONNECT_SRC = ("'self'", "https://challenges.cloudflare.com", "https://cloudflareinsights.com")
CSP_IMG_SRC = ("'self'", "data:", "https:")
CSP_INCLUDE_NONCE_IN = ['script-src', 'style-src']

# 10. EMAIL CONFIGURATION
EMAIL_BACKEND = "django.core.mail.backends.smtp.EmailBackend"
EMAIL_HOST = env('EMAIL_HOST')
EMAIL_PORT = env('EMAIL_PORT')
EMAIL_USE_TLS = env('EMAIL_USE_TLS')
EMAIL_HOST_USER = env('EMAIL_HOST_USER')
EMAIL_HOST_PASSWORD = env('EMAIL_HOST_PASSWORD')

DEFAULT_FROM_EMAIL = EMAIL_HOST_USER
SERVER_EMAIL = EMAIL_HOST_USER
NOTIFY_EMAIL = env('NOTIFY_EMAIL')

# 11. MISC
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'
CRISPY_ALLOWED_TEMPLATE_PACKS = "bootstrap5"
CRISPY_TEMPLATE_PACK = "bootstrap5"
SILENCED_SYSTEM_CHECKS = ["security.W004"]
os.environ['ANONYMIZED_TELEMETRY'] = 'False'