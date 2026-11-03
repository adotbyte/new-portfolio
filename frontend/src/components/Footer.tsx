'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

const Footer = () => {
  const t = useTranslations('footer');
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isWiping, setIsWiping] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const currentYear = new Date().getFullYear();

  const handleFinalWipe = async () => {
    setIsWiping(true);
    try {
      await fetch('/api/chat', { method: 'DELETE' });

      localStorage.clear();
      sessionStorage.clear();
      document.cookie.split(';').forEach((c) => {
        document.cookie = c
          .replace(/^ +/, '')
          .replace(/=.*/, '=;expires=' + new Date().toUTCString() + ';path=/');
      });

      setIsWiping(false);
      setShowConfirm(false);
      setShowPrivacy(false);
      setShowSuccess(true);
      setTimeout(() => {
        window.location.href = '/';
      }, 2000);
    } catch (err) {
      console.error('Wipe failed:', err);
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <>
      {showSuccess && (
        <div className="fixed left-1/2 top-10 z-[10002] flex -translate-x-1/2 animate-bounce items-center gap-3 rounded-full bg-green-600 px-6 py-3 text-white shadow-2xl">
          <span className="font-bold">✓</span>
          {t('historyCleared')}
        </div>
      )}

      <footer className="mt-auto w-full border-t border-gray-100 bg-white py-8 dark:border-gray-800 dark:bg-gray-900">
        <div className="mx-auto max-w-7xl px-6 text-center">
          <p className="text-xs font-medium tracking-wide text-gray-600 dark:text-gray-600">
            &copy; {currentYear} |
            <button
              type="button"
              onClick={() => setShowPrivacy(true)}
              className="ml-2 font-bold text-gray-500 underline decoration-gray-200 underline-offset-4 transition-colors hover:text-blue-600 hover:decoration-blue-200 dark:text-gray-600"
            >
              {t('privacyCookies')}
            </button>
          </p>
        </div>
      </footer>

      {showPrivacy && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md overflow-hidden rounded-[2rem] border border-slate-100 bg-white shadow-2xl dark:border-gray-700 dark:bg-gray-800">
            <div className="p-8">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-black text-gray-900 dark:text-white">
                  {t('modalTitle')}
                </h2>
                <button
                  onClick={() => setShowPrivacy(false)}
                  aria-label="Close"
                  className="text-2xl text-gray-500 hover:text-gray-700 dark:text-gray-600 dark:hover:text-white"
                >
                  &times;
                </button>
              </div>
              <div className="space-y-4 text-left text-sm leading-relaxed text-gray-600 dark:text-gray-600">
                <p>{t('modalIntro')}</p>
                <ul className="space-y-2">
                  <li className="flex gap-2">
                    <span className="text-blue-500">▹</span>
                    <span>
                      <strong>{t('chatHistoryLabel')}</strong> {t('chatHistoryText')}
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-blue-500">▹</span>
                    <span>
                      <strong>{t('themeLabel')}</strong> {t('themeText')}
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-blue-500">▹</span>
                    <span>
                      <strong>{t('readLabel')}</strong>
                      <Link
                        href="/Privacy"
                        className="ml-1 font-bold hover:underline"
                        onClick={() => setShowPrivacy(false)}
                      >
                        {t('readLink')}
                      </Link>
                    </span>
                  </li>
                </ul>
                <div className="rounded-xl border border-amber-100 bg-amber-50 p-4 text-xs italic text-amber-800 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-300">
                  <strong>{t('safetyNote')}</strong> {t('safetyText')}
                </div>
              </div>
              <div className="mt-8 flex gap-3">
                <button
                  onClick={() => setShowConfirm(true)}
                  className="flex-1 rounded-xl border border-red-100 px-4 py-2.5 text-xs font-bold text-red-600 transition-colors hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  {t('wipeData')}
                </button>
                <button
                  onClick={() => setShowPrivacy(false)}
                  className="flex-1 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-blue-200 transition-all hover:bg-blue-700"
                >
                  {t('iUnderstand')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showConfirm && (
        <div className="fixed inset-0 z-[10001] flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
          <div className="w-full max-w-sm rounded-[2rem] border border-slate-800 bg-slate-900 p-8 text-center shadow-2xl">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10 text-2xl text-red-500">
              ⚠
            </div>
            <h3 className="mb-2 text-lg font-bold text-white">{t('finalWarningTitle')}</h3>
            <p className="mb-8 text-sm text-slate-400">{t('finalWarningText')}</p>
            <div className="flex flex-col gap-2">
              <button
                onClick={handleFinalWipe}
                disabled={isWiping}
                className="w-full rounded-xl bg-red-600 py-3 font-bold text-white transition-all hover:bg-red-700 disabled:opacity-50"
              >
                {isWiping ? t('processing') : t('deleteEverything')}
              </button>
              <button
                onClick={() => setShowConfirm(false)}
                className="w-full py-3 font-medium text-slate-400 transition-colors hover:text-white"
              >
                {t('cancel')}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Footer;
