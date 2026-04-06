import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // This is required for Prisma 7 + Next.js 16 to work together
  serverExternalPackages: ['@prisma/client', '@libsql/client'],
};

export default nextConfig;