import { NextRequest, NextResponse } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { routing } from '@/i18n/routing';

const intlMiddleware = createMiddleware(routing);

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Praleisti .well-known (jei matcher nepraleistų)
  if (pathname.startsWith('/.well-known')) {
    return NextResponse.next();
  }

  const acceptHeader = request.headers.get('accept') || '';

  // 2. Markdown Content Negotiation
  if (acceptHeader.includes('text/markdown')) {
    const url = request.nextUrl.clone();
    url.pathname = '/api/markdown-exporter';
    url.searchParams.set('path', pathname);

    const response = NextResponse.rewrite(url);
    response.headers.set('Vary', 'Accept');
    response.headers.set('Content-Type', 'text/markdown; charset=utf-8');
    return response;
  }

  // 3. Generate Nonce
  const nonce = Buffer.from(crypto.getRandomValues(new Uint8Array(16))).toString('base64');
  const isDev = process.env.NODE_ENV === 'development';

  // 4. Define CSP Header
  const cspHeader = `
    default-src 'self';
    script-src 'self' 'unsafe-inline' 'nonce-${nonce}' 'strict-dynamic' https://challenges.cloudflare.com ${isDev ? "'unsafe-eval'" : ''};
    style-src 'self' 'unsafe-inline';
    img-src 'self' blob: data:;
    font-src 'self' data:;
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-src 'self' https://challenges.cloudflare.com https://grafana.morkunas.info;
    frame-ancestors 'none';
    connect-src 'self' https://challenges.cloudflare.com;
    worker-src 'self' blob:;
    upgrade-insecure-requests;
  `
    .replace(/\s{2,}/g, ' ')
    .trim();

  // 5. Forward Nonce & CSP to incoming request headers
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-nonce', nonce);
  requestHeaders.set('Content-Security-Policy', cspHeader);

  // 6. 🔥 Run next-intl middleware (be specialaus perrašymo!)
  // Su defaultLocale: 'lt' ir localePrefix: 'as-needed', next-intl
  // automatiškai aptarnaus '/' kaip lietuvišką turinį be redirect.
  const response = intlMiddleware(
    new NextRequest(request.url, {
      method: request.method,
      headers: requestHeaders,
      body: request.body,
      referrer: request.referrer,
    })
  );

  // 7. Set response headers
  response.headers.set('Content-Security-Policy', cspHeader);
  response.headers.set('x-nonce', nonce);
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), browsing-topics=()'
  );
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  response.headers.set('Cross-Origin-Opener-Policy', 'same-origin');
  response.headers.set('Vary', 'Accept');

  return response;
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|robots\\.txt|sitemap\\.xml|auth\\.md|\\.well-known|favicon\\.ico|apple-touch-icon\\.png|site\\.webmanifest|logo\\.png|.*\\..*).*)',
  ],
};