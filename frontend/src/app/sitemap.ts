import { MetadataRoute } from 'next';
import { readdirSync } from 'fs';
import { join } from 'path';

const BASE_URL = 'https://morkunas.info';
const DEFAULT_LOCALE = 'lt'; // 🔥 Svarbu: atitinka routing.ts
const LOCALES = ['lt', 'en'];

// Pagalbinė funkcija: grąžina URL be prefikso numatytajai kalbai
const buildUrl = (locale: string, path: string = '') => {
  return locale === DEFAULT_LOCALE
    ? `${BASE_URL}${path}`
    : `${BASE_URL}/${locale}${path}`;
};

// Pagalbinė funkcija generuoti hreflang alternatyvas
const generateAlternates = (path: string = '') => {
  const languages: Record<string, string> = {};
  LOCALES.forEach((loc) => {
    languages[loc] = buildUrl(loc, path);
  });
  return { languages };
};

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ['', '/Contact', '/Privacy', '/services', '/blog'];

  const staticPages = routes.flatMap((route) =>
    LOCALES.map((locale) => ({
      url: buildUrl(locale, route),
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: route === '' ? 1.0 : 0.8,
      alternates: generateAlternates(route),
    }))
  );

  let blogPosts: MetadataRoute.Sitemap = [];
  const blogDir = join(process.cwd(), 'public', 'blog');

  try {
    const files = readdirSync(blogDir);
    const slugs = Array.from(
      new Set(files.filter((f) => f.endsWith('.md')).map((f) => f.replace(/\.(lt|en)\.md$/, '')))
    );

    blogPosts = slugs.flatMap((slug) =>
      LOCALES.map((locale) => ({
        url: buildUrl(locale, `/blog/${slug}`),
        lastModified: new Date(),
        changeFrequency: 'monthly' as const,
        priority: 0.7,
        alternates: generateAlternates(`/blog/${slug}`),
      }))
    );
  } catch {
    // Ignoruojame, jei katalogo nėra
  }

  return [...staticPages, ...blogPosts];
}