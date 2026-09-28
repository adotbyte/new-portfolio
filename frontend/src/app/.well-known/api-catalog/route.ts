// app/.well-known/api-catalog/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://morkunas.info';

  const linksetData = {
    linkset: [
      {
        anchor: `${baseUrl}/api`,
        'service-desc': [
          {
            href: `${baseUrl}/api/openapi.json`,
            type: 'application/vnd.oai.openapi+json',
          },
        ],
        'service-doc': [
          {
            href: `${baseUrl}/docs`,
            type: 'text/html',
          },
        ],
        status: [
          {
            href: `${baseUrl}/api/health`,
            type: 'application/json',
          },
        ],
      },
    ],
  };

  return new NextResponse(JSON.stringify(linksetData), {
    status: 200,
    headers: {
      'Content-Type': 'application/linkset+json',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}