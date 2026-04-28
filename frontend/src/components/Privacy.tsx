'use client';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

const Privacy = () => {
  const router = useRouter();
  const t = useTranslations('privacy');

  return (
    <section className="min-h-screen bg-white dark:bg-gray-950 w-full flex flex-col justify-center py-20">
      <div className="w-full max-w-4xl mx-auto px-8">

        <div className="mb-12 flex items-center gap-6">
          <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">{t('title')}</h1>
          <div className="h-[1px] flex-grow bg-gray-100 dark:bg-gray-800"></div>
          <span className="text-xs font-mono text-gray-400 dark:text-gray-500">{t('version')}</span>
        </div>

        <article className="prose prose-slate prose-sm md:prose-base max-w-none dark:prose-invert
          prose-h3:text-blue-600 dark:prose-h3:text-blue-400 prose-h3:font-bold prose-h3:mt-8
          prose-strong:text-gray-900 dark:prose-strong:text-white
          prose-p:text-gray-600 dark:prose-p:text-gray-300 prose-p:leading-relaxed">

          <p className="text-sm italic text-gray-400 dark:text-gray-500 mb-8">{t('lastUpdated')}</p>

          <h3>{t('section1Title')}</h3>
          <p>{t('section1Intro')}</p>
          <ul>
            <li><strong>{t('chatHistoryLabel')}</strong> {t('chatHistoryText')}</li>
            <li><strong>{t('preferencesLabel')}</strong> {t('preferencesText')}</li>
            <li><strong>{t('visitorIdLabel')}</strong> {t('visitorIdText')}</li>
          </ul>

          <h3>{t('section2Title')}</h3>
          <p>{t('section2Text')}</p>

          <h3>{t('section3Title')}</h3>
          <p>{t('section3Text')}</p>

          <h3>{t('section4Title')}</h3>
          <p>{t('section4Text')}</p>
          <p className="bg-slate-50 dark:bg-gray-800 p-4 rounded-xl border border-slate-100 dark:border-gray-700">
            <strong>{t('section4LegalBasis')}</strong> {t('section4LegalText')}
          </p>

          <h3>{t('section5Title')}</h3>
          <p>{t('section5Text')}</p>
        </article>

        <div className="mt-12 pt-8 border-t border-gray-100 dark:border-gray-800">
          <button
            onClick={() => router.back()}
            className="text-blue-600 dark:text-blue-400 font-bold text-sm hover:underline cursor-pointer flex items-center"
          >
            {t('back')}
          </button>
        </div>
      </div>
    </section>
  );
};

export default Privacy;