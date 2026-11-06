import { Suspense } from 'react';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { readFileSync } from 'fs';
import { join } from 'path';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ArrowLeft } from 'lucide-react';
import CopyButton from '@/components/CopyButton';
import CodePlayground from '@/components/CodePlayground';
import { connection } from 'next/server';
import type { Metadata } from 'next';

export const instant = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;

  // Nuskaitome straipsnio turinį, kad galėtume ištraukti pavadinimą ir aprašymą
  let content = '';
  const blogDir = join(process.cwd(), 'public', 'blog');

  try {
    try {
      content = readFileSync(join(blogDir, `${slug}.${locale}.md`), 'utf-8');
    } catch {
      content = readFileSync(join(blogDir, `${slug}.lt.md`), 'utf-8');
    }
  } catch {
    content = '# Straipsnis nerastas';
  }

  const lines = content.split('\n');
  const title = lines[0].replace('# ', '').trim() || slug;

  // Ieškome pirmos pastraipos (praleidžiame tuščias eilutes ir antraštes)
  const firstParagraph =
    lines.slice(1).find((line) => line.trim() !== '' && !line.startsWith('#')) || '';

  // Aprašymas turi būti bent 100 simbolių
  const description =
    firstParagraph.length > 160
      ? firstParagraph.substring(0, 160) + '...'
      : firstParagraph + ' Skaitykite daugiau šiame straipsnyje.';

  const baseUrl = 'https://morkunas.info';

  return {
    title: `${title} | Audrius Morkūnas`,
    description,
    openGraph: {
      title,
      description,
      type: 'article',
      authors: ['Audrius Morkūnas'],
      url: `${baseUrl}/${locale}/blog/${slug}`,
      images: [
        {
          url: `${baseUrl}/${locale}/blog/${slug}/opengraph-image`,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      locale: locale === 'lt' ? 'lt_LT' : 'en_US',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [`${baseUrl}/${locale}/blog/${slug}/opengraph-image`],
    },
  };
}

export default function BlogPostPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  return (
    <Suspense fallback={<BlogSkeleton />}>
      <BlogPostContent params={params} />
    </Suspense>
  );
}

async function BlogPostContent({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  const t = await getTranslations({ locale, namespace: 'blog' });

  let content = '';
  const blogDir = join(process.cwd(), 'public', 'blog');

  try {
    try {
      content = readFileSync(join(blogDir, `${slug}.${locale}.md`), 'utf-8');
    } catch {
      content = readFileSync(join(blogDir, `${slug}.lt.md`), 'utf-8');
    }
  } catch {
    content = '# Straipsnis nerastas\nAtsiprašome, šis straipsnis neegzistuoja.';
  }

  await connection();

  // JSON-LD struktūriniai duomenys Google paieškai
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: content.split('\n')[0].replace('# ', ''),
    description: content.split('\n')[2]?.substring(0, 160) || 'Straipsnis',
    author: {
      '@type': 'Person',
      name: 'Audrius Morkūnas',
      url: 'https://morkunas.info',
    },
    datePublished: new Date().toISOString(),
    image: `https://morkunas.info/${locale}/blog/${slug}/opengraph-image`,
  };

  return (
    <div className="min-h-screen bg-white py-24 text-gray-900 dark:bg-gray-950 dark:text-gray-100 sm:py-32">
      {/* JSON-LD scriptas */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="mx-auto max-w-3xl px-6 lg:px-8">
        <Link
          href={`/${locale}/blog`}
          className="mb-10 inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:underline dark:text-blue-700"
        >
          <ArrowLeft className="h-4 w-4" />
          {t('back')}
        </Link>

        <article className="prose prose-sm max-w-none dark:prose-invert md:prose-base prose-headings:font-bold prose-headings:tracking-tight prose-h1:mb-8 prose-h1:text-4xl prose-h2:mb-4 prose-h2:mt-10 prose-h2:text-2xl prose-p:leading-relaxed prose-pre:bg-transparent prose-pre:p-0">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              code({ node, className, children, ...props }) {
                const match = /language-(\w+)/.exec(className || '');
                const codeString = String(children).replace(/\n$/, '');
                const isInline = !className && !codeString.includes('\n');

                if (isInline) {
                  return (
                    <code className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-sm text-gray-800 dark:bg-gray-800 dark:text-gray-200">
                      {children}
                    </code>
                  );
                }

                return (
                  <div className="my-6 overflow-hidden rounded-lg border border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900">
                    <div className="flex items-center justify-between border-b border-gray-200 bg-gray-100 px-4 py-2 text-xs text-gray-500 dark:border-gray-800 dark:bg-gray-800 dark:text-gray-400">
                      <span className="font-mono font-medium">{match?.[1] || 'text'}</span>
                      <CopyButton text={codeString} />
                    </div>
                    <div className="overflow-x-auto whitespace-pre p-6 font-mono text-sm leading-relaxed text-gray-800 dark:text-gray-200">
                      {codeString}
                    </div>
                  </div>
                );
              },
              p({ children }) {
                if (
                  Array.isArray(children) &&
                  typeof children[0] === 'string' &&
                  children[0].trim() === '<CodePlayground />'
                ) {
                  return <CodePlayground />;
                }
                return <p>{children}</p>;
              },
            }}
          >
            {content}
          </ReactMarkdown>
        </article>
      </div>
    </div>
  );
}

// Paprastas fallback'as, kol kraunasi straipsnis
function BlogSkeleton() {
  return (
    <div className="min-h-screen bg-white py-24 dark:bg-gray-950 sm:py-32">
      <div className="mx-auto max-w-3xl animate-pulse px-6 lg:px-8">
        <div className="mb-10 h-4 w-32 rounded bg-gray-200 dark:bg-gray-800"></div>
        <div className="mb-6 h-10 w-3/4 rounded bg-gray-200 dark:bg-gray-800"></div>
        <div className="space-y-4">
          <div className="h-4 w-full rounded bg-gray-200 dark:bg-gray-800"></div>
          <div className="h-4 w-full rounded bg-gray-200 dark:bg-gray-800"></div>
          <div className="h-4 w-5/6 rounded bg-gray-200 dark:bg-gray-800"></div>
        </div>
      </div>
    </div>
  );
}
