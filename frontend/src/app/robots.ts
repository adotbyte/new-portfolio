// app/robots.ts
import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://morkunas.info';

  return {
    rules: [
      // 1. Speciali taisyklė Googlebot: leidžiame viską, išskyrus admin zonas
      {
        userAgent: 'Googlebot',
        allow: ['/', '/api/chat', '/api/homelab'], // Leidžiame reikalingus API
        disallow: ['/api/admin/', '/admin/', '/private/'], // Blokuojame tik jautrias zonas
      },
      // 2. Bendra taisyklė visiems kitiems robotams
      {
        userAgent: '*',
        allow: '/',
        // PAKEITIMAS: Vietoje '/api/' blokuojame tik admin API,
        // kad neblokuotume Googlebot (jei jis nepatektų į 1 taisyklę)
        disallow: ['/api/admin/', '/admin/', '/private/'],
      },
      // 3. AI robotų blokavimas
      {
        userAgent: [
          'GPTBot',
          'GhatGPT-User',
          'CCBot',
          'Anthropic-ai',
          'ClaudeBot',
          'Google-Extended', // Google-Extended yra AI mokymui, ne paieškai
        ],
        disallow: ['/'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
