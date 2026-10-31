'use client';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

const Privacy = () => {
  const router = useRouter();
  const t = useTranslations('privacy');

  return (
    <section className="flex min-h-screen w-full flex-col justify-center bg-white py-20 dark:bg-gray-950">
      <div className="mx-auto w-full max-w-4xl px-8">
        <div className="mb-12 flex items-center gap-6">
          <h1 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white">
            {t('title')}
          </h1>
          <div className="h-[1px] flex-grow bg-gray-100 dark:bg-gray-800"></div>
          <span className="font-mono text-xs text-gray-400 dark:text-gray-500">{t('version')}</span>
        </div>

        <article className="prose prose-sm prose-slate max-w-none dark:prose-invert md:prose-base prose-h3:mt-8 prose-h3:font-bold prose-h3:text-blue-600 prose-p:leading-relaxed prose-p:text-gray-600 prose-strong:text-gray-900 dark:prose-h3:text-blue-400 dark:prose-p:text-gray-300 dark:prose-strong:text-white">
          <p className="mb-8 text-sm italic text-gray-400 dark:text-gray-500">{t('lastUpdated')}</p>

          <h3>{t('section1Title')}</h3>
          <p>{t('section1Intro')}</p>

          <ul>
            <li>
              <strong>{t('chatHistoryLabel')}</strong> {t('chatHistoryText')}
            </li>
            <li>
              <strong>{t('preferencesLabel')}</strong> {t('preferencesText')}
            </li>
            <li>
              <strong>{t('visitorIdLabel')}</strong> {t('visitorIdText')}
            </li>
          </ul>

          <h3>{t('section2Title')}</h3>
          <p>{t('section2Text')}</p>

          <h3>{t('section3Title')}</h3>
          <p>{t('section3Text')}</p>

          <h3>{t('section4Title')}</h3>
          <p>{t('section4Text')}</p>
          <p className="rounded-xl border border-slate-100 bg-slate-50 p-4 dark:border-gray-700 dark:bg-gray-800">
            <strong>{t('section4LegalBasis')}</strong> {t('section4LegalText')}
          </p>

          <h3>{t('section5Title')}</h3>
          <p>{t('section5Text')}</p>
        </article>

        <div className="mt-12 border-t border-gray-100 pt-8 dark:border-gray-800">
          <button
            onClick={() => router.back()}
            className="flex cursor-pointer items-center text-sm font-bold text-blue-600 hover:underline dark:text-blue-400"
          >
            {t('back')}
          </button>
        </div>
      </div>
    </section>
  );
};

export default Privacy;
