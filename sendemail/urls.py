from django.urls import path
from . import views

urlpatterns = [
    # This results in: /api/email/contact/
    path('contact/', views.contact_api, name='contact_api'),
]