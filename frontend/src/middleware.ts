import { NextRequest } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { routing } from '@/i18n/routing';

const intlMiddleware = createMiddleware(routing);

export default function middleware(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64');

  const cspHeader = `
    default-src 'self';
    script-src 'nonce-${nonce}' 'strict-dynamic' https://challenges.cloudflare.com https://*.zoho.com;
    style-src 'self' 'unsafe-inline';
    img-src 'self' blob: data: https://*.zoho.com;
    font-src 'self' data:;
    object-src 'none';
    base-uri 'self';
    form-action 'self' https://*.zoho.com;
    frame-src 'self' https://challenges.cloudflare.com https://*.zoho.com;
    frame-ancestors 'none';
    connect-src 'self' https://challenges.cloudflare.com https://*.zoho.com;
    worker-src 'self' blob:;
    upgrade-insecure-requests;
  `.replace(/\s{2,}/g, ' ').trim();

  // Forward nonce to request headers so layout can read it via headers()
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-nonce', nonce);

  const response = intlMiddleware(
    new NextRequest(request.url, {
      method: request.method,
      headers: requestHeaders,
      body: request.body,
      referrer: request.referrer,
    })
  );

  response.headers.set('Content-Security-Policy', cspHeader);
  response.headers.set('x-nonce', nonce);
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), browsing-topics=()');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('Cross-Origin-Opener-Policy', 'same-origin');

  return response;
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|apple-touch-icon.png|site.webmanifest).*)'],
};