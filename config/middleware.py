import secrets # Built-in Python library

class SecurityHeadersMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # 1. Generate a nonce for this specific request
        # If using 'django-csp', it might already be there as request.csp_nonce
        nonce = getattr(request, 'csp_nonce', secrets.token_urlsafe(16))
        request.csp_nonce = nonce 

        response = self.get_response(request)

        # 2. Update the header: Replace 'unsafe-inline' with the nonce
        csp_policy = (
            f"default-src 'self'; "
            f"script-src 'self' 'nonce-{nonce}' https://challenges.cloudflare.com https://cdnjs.cloudflare.com https://cdn.jsdelivr.net; "
            f"style-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com https://cdn.jsdelivr.net; "
            f"img-src 'self' data: https://cdnjs.cloudflare.com; "
            f"font-src 'self' https://cdn.jsdelivr.net; "
            f"connect-src 'self' https://cdn.jsdelivr.net https://cloudflareinsights.com https://challenges.cloudflare.com; "
            f"frame-src 'self' https://challenges.cloudflare.com;"
        )
        
        response["Content-Security-Policy"] = csp_policy
        response["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()"
        
        return response