import ReactMarkdown from 'react-markdown';
import { readFileSync } from 'fs';
import { join } from 'path';
import { getTranslations, getLocale } from 'next-intl/server';

const AboutMe = async () => {
  const t = await getTranslations('about');
  const locale = await getLocale();

  const content = (() => {
    try {
      return readFileSync(join(process.cwd(), 'public', `about_me.${locale}.md`), 'utf-8');
    } catch {
      try {
        return readFileSync(join(process.cwd(), 'public', 'about_me.md'), 'utf-8');
      } catch {
        return '';
      }
    }
  })();

  const skillCategories = [
    { name: t('categories.infrastructure'), items: ['Linux', 'Docker', 'Nginx'] },
    { name: t('categories.backend'),        items: ['Django', 'Postgres'] },
    { name: t('categories.frontend'),       items: ['Next.js', 'React', 'Tailwind'] },
  ];

  return (
    <section id="about" className="w-full relative bg-white dark:bg-gray-950 py-auto overflow-x-hidden">
      <div className="w-full max-w-7xl mx-auto px-6 md:px-8">
        <div className="mb-12 flex items-center gap-6">
          <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight"></h2>
          <div className="h-[1px] flex-grow bg-gray-100 dark:bg-gray-800"></div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 xl:gap-16 items-start w-full max-w-full">
          <div className="lg:col-span-8 w-full min-w-0">
            <article className="prose prose-sm md:prose-base max-w-none break-words overflow-hidden
              dark:prose-invert prose-headings:font-bold prose-headings:tracking-tight
              prose-h1:text-3xl prose-h1:mb-4 prose-h2:text-xl prose-h2:mt-6 prose-h2:mb-3
              prose-p:leading-relaxed prose-hr:my-6">
              <ReactMarkdown>{content}</ReactMarkdown>
            </article>
          </div>
          <aside className="lg:col-span-4 sticky top-28 w-full">
            <div className="bg-slate-50 dark:bg-gray-800 p-7 rounded-[2rem] border border-slate-100 dark:border-gray-700 shadow-sm">
              <h3 className="text-[11px] font-black text-blue-700 dark:text-blue-400 uppercase tracking-[0.2em] mb-6">
                {t('technicalStack')}
              </h3>
              <div className="space-y-6">
                {skillCategories.map((cat) => (
                  <div key={cat.name}>
                    <p className="text-[11px] font-bold text-gray-600 dark:text-gray-400 uppercase mb-3 tracking-wider">{cat.name}</p>
                    <div className="flex flex-wrap gap-2">
                      {cat.items.map((skill) => (
                        <span key={skill} className="px-3 py-1 bg-white dark:bg-gray-700 border border-slate-200 dark:border-gray-600 text-slate-800 dark:text-slate-200 text-[11px] font-semibold rounded-lg shadow-sm whitespace-nowrap">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <div className="pt-6 mt-8 border-t border-slate-200 dark:border-gray-700 flex items-center justify-between text-[11px]">
                <span className="text-gray-700 dark:text-gray-300 font-semibold">{t('status')}:</span>
                <span className="text-green-700 dark:text-green-400 font-bold flex items-center">
                  <span className="w-2.5 h-2.5 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                  {t('online')}
                </span>
              </div>
              <div className="mt-5 bg-gray-100 dark:bg-slate-900 p-4 rounded-2xl font-mono text-[11px] text-blue-600 dark:text-blue-300 shadow-inner overflow-hidden">
                <div className="flex gap-1.5 mb-2">
                  <div className="w-2 h-2 rounded-full bg-red-500/50"></div>
                  <div className="w-2 h-2 rounded-full bg-yellow-500/50"></div>
                  <div className="w-2 h-2 rounded-full bg-green-500/50"></div>
                </div>
                <span className="text-gray-400 dark:text-gray-500">$</span> uptime: <span className="text-gray-900 dark:text-white">up 24/7</span>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
};

export default AboutMe;