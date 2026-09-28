// app/.well-known/oauth-protected-resource/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://morkunas.info';

  const prmData = {
    resource: baseUrl,
    authorization_servers: [baseUrl],
    scopes_supported: ['read', 'write', 'agent'],
    bearer_methods_supported: ['header'],
  };

  return new NextResponse(JSON.stringify(prmData), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}