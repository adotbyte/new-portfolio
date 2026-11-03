import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { readdirSync } from 'fs';
import { join } from 'path';
import { FileText, ArrowRight } from 'lucide-react';

export default async function BlogPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'blog' });

  const blogDir = join(process.cwd(), 'public', 'blog');
  let posts: { slug: string; title: string }[] = [];

  try {
    const files = readdirSync(blogDir);
    // Ieškome .lt.md arba .en.md failų
    posts = files
      .filter((f) => f.endsWith('.md'))
      .map((f) => {
        const slug = f.replace(/\.(lt|en)\.md$/, '');
        // Pavadinimą paimame iš failo pavadinimo ir padarome gražų
        const title = slug
          .split('-')
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(' ');
        return { slug, title };
      });

    // Pašaliname dublikatus, jei yra ir lt, ir en versijos
    posts = Array.from(new Map(posts.map((p) => [p.slug, p])).values());
  } catch {
    // Jei katalogo nėra
  }

  return (
    <div className="min-h-screen bg-white py-24 dark:bg-gray-950 sm:py-32">
      <div className="mx-auto max-w-4xl px-6 lg:px-8">
        <div className="mb-16">
          <h1 className="mb-4 text-4xl font-black tracking-tight text-gray-900 dark:text-white">
            {t('title')}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">{t('subtitle')}</p>
        </div>

        {posts.length === 0 ? (
          <p className="text-gray-500">{t('noPosts')}</p>
        ) : (
          <div className="flex flex-col gap-6">
            {posts.map((post) => (
              <Link
                key={post.slug}
                href={`/${locale}/blog/${post.slug}`}
                className="group flex items-center justify-between rounded-2xl border border-gray-200 bg-white p-6 transition-colors hover:border-blue-500 dark:border-gray-800 dark:bg-gray-900 dark:hover:border-blue-500"
              >
                <div className="flex items-center gap-4">
                  <div className="rounded-xl bg-blue-50 p-3 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
                    <FileText className="h-6 w-6" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 transition-colors group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">
                    {post.title}
                  </h2>
                </div>
                <ArrowRight className="h-5 w-5 text-gray-400 transition-colors group-hover:text-blue-600" />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
