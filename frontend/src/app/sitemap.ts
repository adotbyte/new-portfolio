import { MetadataRoute } from 'next';
import { readdirSync } from 'fs';
import { join } from 'path';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://morkunas.info';

  // 1. Pagrindiniai puslapiai ir jų kalbos
  const routes = ['', '/Contact', '/Privacy', '/services', '/blog'];
  const locales = ['lt', 'en'];

  const staticPages = routes.flatMap((route) =>
    locales.map((locale) => ({
      url: `${baseUrl}/${locale}${route}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: route === '' ? 1.0 : 0.8,
    }))
  );

  // 2. Tinklaraščio straipsniai
  let blogPosts: MetadataRoute.Sitemap = [];
  const blogDir = join(process.cwd(), 'public', 'blog');

  try {
    const files = readdirSync(blogDir);

    // Išrenkame unikalius straipsnių slug'us (be .lt.md ar .en.md galūnių)
    const slugs = Array.from(
      new Set(files.filter((f) => f.endsWith('.md')).map((f) => f.replace(/\.(lt|en)\.md$/, '')))
    );

    blogPosts = slugs.flatMap((slug) =>
      locales.map((locale) => ({
        url: `${baseUrl}/${locale}/blog/${slug}`,
        lastModified: new Date(),
        changeFrequency: 'monthly' as const,
        priority: 0.7,
      }))
    );
  } catch {
    // Jei katalogo nėra, tiesiog ignoruojame
  }

  return [...staticPages, ...blogPosts];
}
