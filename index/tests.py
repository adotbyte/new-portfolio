from django.test import TestCase
from django.urls import reverse

class SecurityHeadersTest(TestCase):
    def test_csp_headers_present(self):
        """
        Verify that the CSP header is present in the response.
        """
        # Test the home page (or any public view)
        response = self.client.get('/')
        
        # Check if the header exists
        self.assertIn('Content-Security-Policy', response)
        
        csp_header = response['Content-Security-Policy']
        
        # Verify critical directives are included
        self.assertIn("default-src 'self'", csp_header)
        self.assertIn("https://cdn.jsdelivr.net", csp_header)

    def test_csp_nonce_generation(self):
        """
        Verify that the middleware is generating a nonce and 
        it changes on every request.
        """
        response_one = self.client.get('/')
        nonce_one = response_one.wsgi_request.csp_nonce
        
        response_two = self.client.get('/')
        nonce_two = response_two.wsgi_request.csp_nonce
        
        # Nonces must be unique per request
        self.assertNotEqual(nonce_one, nonce_two)