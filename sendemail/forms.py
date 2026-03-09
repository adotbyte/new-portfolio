from django import forms
from .validators import validate_email_domain
from turnstile.fields import TurnstileField


class ContactForm(forms.Form):
    
    name = forms.CharField(
        max_length=100,
        required=True,
        widget=forms.TextInput(attrs={"placeholder": "Name"})
    )
    
    email = forms.EmailField(
        required=True,
        widget=forms.TextInput(attrs={"placeholder": "Your e-mail"})
    )
    
    message = forms.CharField(
        required=True,
        widget=forms.Textarea(attrs={"placeholder": "Your message"})
    )
    
#email checked validate email address
    email = forms.EmailField(validators=[validate_email_domain])
    message = forms.CharField(widget=forms.Textarea)
    captcha = TurnstileField(
        theme='auto', 
        size='compact',
        error_messages={
            'invalid': 'Verification failed. Please try the captcha again to prove you are human!'
        }
    )
