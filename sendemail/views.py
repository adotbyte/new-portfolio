import json
import requests
import logging
from django.http import JsonResponse
from django.core.mail import send_mail
from django.conf import settings
from django.views.decorators.csrf import ensure_csrf_cookie # Add this
from django.views.decorators.http import require_POST       # Add this
from django.views.decorators.csrf import csrf_protect
from django.views.decorators.csrf import csrf_exempt

logger = logging.getLogger(__name__)

@csrf_exempt
def contact_api(request):
    try:
        data = json.loads(request.body)
        
        # 1. Get Form Data
        name = data.get('name', 'No Name')
        email = data.get('email', 'No Email')
        message_content = data.get('message', 'No Message')
        turnstile_token = data.get('cf-turnstile-response')

        # 2. Verify Turnstile Token (Logic remains the same)
        if not turnstile_token:
            return JsonResponse({"status": "error", "message": "Captcha missing"}, status=400)

        verify_response = requests.post(
            "https://challenges.cloudflare.com/turnstile/v0/siteverify",
            data={
                'secret': settings.TURNSTILE_SECRET_KEY,
                'response': turnstile_token,
            },
            timeout=5
        )
        
        outcome = verify_response.json()

        if not outcome.get('success'):
            logger.warning(f"Failed Turnstile attempt from {email}. Errors: {outcome.get('error-codes')}")
            return JsonResponse({"status": "error", "message": "Invalid Captcha"}, status=400)

        # 3. Send the email (Make sure settings.NOTIFY_EMAIL is in your new settings!)
        subject = f"New Portfolio Message from {name}"
        full_message = f"From: {name} <{email}>\n\n{message_content}"
        
        send_mail(
            subject,
            full_message,
            settings.DEFAULT_FROM_EMAIL,
            [settings.NOTIFY_EMAIL], 
            fail_silently=False,
        )

        return JsonResponse({"status": "success"})

    except Exception as e:
        logger.error(f"Contact API Error: {str(e)}")
        # Adding more detail to the error helps you debug!
        return JsonResponse({"status": "error", "message": f"Server Error: {str(e)}"}, status=500)