import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const nextConfig: NextConfig = {
  output: 'standalone',
  outputFileTracingIncludes: {
    '/*': ['./src/middleware.ts'],
  },
  serverExternalPackages: ['@prisma/client', '@libsql/client'],
};

export default withNextIntl(nextConfig);