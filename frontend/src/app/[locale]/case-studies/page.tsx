import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { Briefcase, ArrowRight } from 'lucide-react';

export default async function CaseStudiesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'caseStudies' });

  // Čia aprašome savo "vidinius" projektus kaip Case Studies
  const cases = [
    {
      id: 'ai-chatbot',
      title: t('aiChatbot.title'),
      problem: t('aiChatbot.problem'),
      solution: t('aiChatbot.solution'),
      result: t('aiChatbot.result'),
      tech: ['Next.js', 'Claude AI', 'Docker', 'Raspberry Pi'],
    },
    {
      id: 'homelab-automation',
      title: t('homelab.title'),
      problem: t('homelab.problem'),
      solution: t('homelab.solution'),
      result: t('homelab.result'),
      tech: ['Ansible', 'Docker', 'Google Drive', 'GitHub Actions'],
    },
    {
      id: 'performance-optimization',
      title: t('performance.title'),
      problem: t('performance.problem'),
      solution: t('performance.solution'),
      result: t('performance.result'),
      tech: ['Next.js', 'React', 'Tailwind CSS', 'Lighthouse'],
    },
  ];

  return (
    <div className="min-h-screen bg-white py-24 dark:bg-gray-950 sm:py-32">
      <div className="mx-auto max-w-5xl px-6 lg:px-8">
        <div className="mb-16 text-center">
          <h1 className="mb-4 text-4xl font-black tracking-tight text-gray-900 dark:text-white">
            {t('title')}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">{t('subtitle')}</p>
        </div>

        <div className="space-y-12">
          {cases.map((c) => (
            <div
              key={c.id}
              className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm dark:border-gray-800 dark:bg-gray-900 md:p-12"
            >
              <div className="mb-6 flex items-center gap-4">
                <div className="rounded-xl bg-blue-50 p-3 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
                  <Briefcase className="h-6 w-6" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{c.title}</h2>
              </div>

              <div className="grid gap-8 md:grid-cols-2">
                <div>
                  <h3 className="mb-2 text-sm font-bold uppercase tracking-wider text-gray-500">
                    {t('problemLabel')}
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300">{c.problem}</p>
                </div>
                <div>
                  <h3 className="mb-2 text-sm font-bold uppercase tracking-wider text-gray-500">
                    {t('solutionLabel')}
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300">{c.solution}</p>
                </div>
              </div>

              <div className="mt-8 border-t border-gray-100 pt-6 dark:border-gray-800">
                <h3 className="mb-2 text-sm font-bold uppercase tracking-wider text-green-600 dark:text-green-400">
                  {t('resultLabel')}
                </h3>
                <p className="font-medium text-gray-900 dark:text-white">{c.result}</p>
              </div>

              <div className="mt-6 flex flex-wrap gap-2">
                {c.tech.map((tech) => (
                  <span
                    key={tech}
                    className="rounded-lg bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600 dark:bg-gray-800 dark:text-gray-300"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <Link
            href={`/${locale}/Contact`}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-blue-700"
          >
            {t('cta')}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
