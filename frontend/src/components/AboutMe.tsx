import ReactMarkdown from 'react-markdown';
import { readFileSync } from 'fs';
import { join } from 'path';
import { getTranslations } from 'next-intl/server';
import TerminalWidget from './TerminalWidget';

export const runtime = 'nodejs';

// Atskira duomenų gavimo funkcija, pažymėta "use cache"
async function getAboutContent(locale: string) {
  'use cache';
  let filePath = join(process.cwd(), 'public', `about_me.${locale}.md`);
  let content = '';

  try {
    content = readFileSync(filePath, 'utf-8');
  } catch {
    filePath = join(process.cwd(), 'public', 'about_me.md');
    try {
      content = readFileSync(filePath, 'utf-8');
    } catch {
      content = 'Nepavyko įkelti teksto.';
    }
  }
  return content;
}

export default async function AboutMe({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: 'about' });
  const content = await getAboutContent(locale);

  const skillCategories = [
    { name: t('categories.infrastructure'), items: ['Linux', 'Docker', 'Nginx'] },
    { name: t('categories.backend'), items: ['Django', 'Postgres'] },
    {
      name: t('categories.frontend'),
      items: ['Next.js', 'React', 'Tailwind', 'JavaScript (ES6+)', 'HTML5/CSS3'],
    },
  ];

  return (
    <section
      id="about"
      className="py-auto relative w-full overflow-x-hidden bg-white dark:bg-gray-950"
    >
      <div className="mx-auto w-full max-w-7xl px-6 md:px-8">
        {/* Ištryniau h2 su title, palikau tik liniją */}
        <div className="mb-12 flex items-center gap-6">
          <h1 className="sr-only">Audrius Morkūnas | AI & Next.js Kūrėjas</h1>
          <div className="h-[1px] flex-grow bg-gray-100 dark:bg-gray-800"></div>
        </div>

        <div className="grid w-full max-w-full grid-cols-1 items-start gap-8 lg:grid-cols-12 xl:gap-16">
          <div className="w-full min-w-0 lg:col-span-8">
            <article className="prose prose-sm max-w-none overflow-hidden break-words dark:prose-invert md:prose-base prose-headings:font-bold prose-headings:tracking-tight prose-h1:mb-4 prose-h1:text-3xl prose-h2:mb-3 prose-h2:mt-6 prose-h2:text-xl prose-p:leading-relaxed prose-hr:my-6">
              <ReactMarkdown>{content}</ReactMarkdown>
            </article>
          </div>
          <aside className="sticky top-28 w-full lg:col-span-4">
            <div className="rounded-[2rem] border border-slate-100 bg-slate-50 p-7 shadow-sm dark:border-gray-700 dark:bg-gray-800">
              <h3 className="mb-6 text-[11px] font-black uppercase tracking-[0.2em] text-blue-700 dark:text-blue-700">
                {t('technicalStack')}
              </h3>
              <div className="space-y-6">
                {skillCategories.map((cat) => (
                  <div key={cat.name}>
                    <p className="mb-3 text-[11px] font-bold uppercase tracking-wider text-gray-600 dark:text-gray-600">
                      {cat.name}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {cat.items.map((skill) => (
                        <span
                          key={skill}
                          className="whitespace-nowrap rounded-lg border border-slate-200 bg-white px-3 py-1 text-[11px] font-semibold text-slate-800 shadow-sm dark:border-gray-600 dark:bg-gray-700 dark:text-slate-200"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-8 flex items-center justify-between border-t border-slate-200 pt-6 text-[11px] dark:border-gray-700">
                <span className="font-semibold text-gray-700 dark:text-gray-300">
                  {t('status')}:
                </span>
                <span className="flex items-center font-bold text-green-700 dark:text-green-400">
                  <span className="mr-2 h-2.5 w-2.5 animate-pulse rounded-full bg-green-500"></span>
                  {t('online')}
                </span>
              </div>

              <TerminalWidget />
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
