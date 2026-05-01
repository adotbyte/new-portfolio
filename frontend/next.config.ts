import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const nextConfig: NextConfig = {
  output: 'standalone',
  outputFileTracingIncludes: {
    '/*': ['./src/middleware.ts'],
  },
  serverExternalPackages: ['@prisma/client', '@libsql/client'],

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // NO CSP here — middleware handles it with nonce
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), browsing-topics=()',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ];
  },
};



export default withNextIntl(nextConfig);