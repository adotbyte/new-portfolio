import createMiddleware from 'next-intl/middleware';
import {routing} from '@/i18n/routing';

export default createMiddleware(routing);

export const config = {
  // Match all pathnames except for static files and internal Next.js paths
  matcher: ['/', '/(lt|en)/:path*', '/((?!_next|_vercel|api|.*\\..*).*)']
};