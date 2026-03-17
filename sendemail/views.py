import json
import requests
import logging
from django.http import JsonResponse
from django.core.mail import send_mail
from django.conf import settings

logger = logging.getLogger(__name__)

# REMOVED @csrf_exempt - your React app now sends the CSRF token properly!
def contact_api(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            
            # 1. Get Form Data
            name = data.get('name', 'No Name')
            email = data.get('email', 'No Email')
            message_content = data.get('message', 'No Message')
            turnstile_token = data.get('cf-turnstile-response')

            # 2. Verify Turnstile Token
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

            # 3. Send the email
            subject = f"New Portfolio Message from {name}"
            full_message = f"From: {name} <{email}>\n\n{message_content}"
            
            send_mail(
                subject,
                full_message,
                settings.DEFAULT_FROM_EMAIL,
                [settings.NOTIFY_EMAIL], # Ensure this is defined in settings.py!
                fail_silently=False,
            )

            return JsonResponse({"status": "success"})

        except Exception as e:
            logger.error(f"Contact API Error: {str(e)}")
            return JsonResponse({"status": "error", "message": "An internal error occurred."}, status=500)

    return JsonResponse({"status": "error", "message": "Method not allowed"}, status=405)