from django.db import models
from .validators import validate_email_domain

# Create your models here.
class Contact(models.Model):
    email = models.EmailField(validators=[validate_email_domain])
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)