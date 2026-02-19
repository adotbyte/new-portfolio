from django.core.exceptions import ValidationError

ALLOWED_DOMAINS = ['gmail.com', 'yahoo.com', 'yourdomain.com', '.lt', '.com', '.net', '.org', '.edu', '.gov', '.info', '.eu']
ALLOWED_SUFFIXES = ['.lt', '.com', '.net', '.org', '.edu', '.gov', '.info', '.eu']

def validate_email_domain(value):
    email = value.lower()
    domain = email.split("@")[-1]

    # check domain
    if domain in ALLOWED_DOMAINS:
        return value

    # check suffix
    if any(domain.endswith(suffix) for suffix in ALLOWED_SUFFIXES):
        return value

    raise ValidationError("Email domain not allowed. Please use an approved email address.")