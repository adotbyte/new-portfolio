from django import forms
from .validators import validate_email_domain


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
    
    # Honeypot field (hidden from humans)
    honeypot = forms.CharField(required=False, widget=forms.HiddenInput)
    
    # Validate the honeypot
    def clean_honeypot(self):
        data = self.cleaned_data['honeypot']
        if data:
            raise forms.ValidationError("Spam detected.")
        return data