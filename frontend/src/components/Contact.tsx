'use client';
import { useState, useEffect } from 'react';
import { Turnstile } from '@marsidev/react-turnstile';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';

const Contact = () => {
  const t = useTranslations('contact');
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [isDark, setIsDark] = useState(false);
  // Būsena, kuri nurodo, ar jau laikas rodyti Turnstile
  const [showTurnstile, setShowTurnstile] = useState(false);
  const params = useParams();
  const currentLocale = params.locale as string;

  useEffect(() => {
    const check = () => setIsDark(document.documentElement.classList.contains('dark'));
    check();
    const observer = new MutationObserver(check);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  // Ši funkcija iškviečiama, kai vartotojas pradeda pildyti bet kurį lauką
  const handleInputFocus = () => {
    if (!showTurnstile) {
      setShowTurnstile(true);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Jei Turnstile dar neįkeltas (vartotojas nepradėjo pildyti), parodome jį
    if (!showTurnstile) {
      setShowTurnstile(true);
      return;
    }

    if (!turnstileToken) {
      alert(t('captchaError'));
      return;
    }
    setStatus('loading');
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, 'cf-turnstile-response': turnstileToken }),
      });
      if (response.ok) {
        setStatus('success');
        setFormData({ name: '', email: '', message: '' });
        setShowTurnstile(false); // Paslėpti po sėkmės
        setTurnstileToken(null);
        setTimeout(() => setStatus('idle'), 5000);
      } else {
        setStatus('error');
      }
    } catch (err) {
      console.error('Network error:', err);
      setStatus('error');
    }
  };

  return (
    <section
      id="contact"
      className="flex min-h-[80vh] items-center justify-center bg-white px-6 dark:bg-gray-950"
    >
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md space-y-6 rounded-2xl border border-gray-100 bg-white p-8 shadow-xl dark:border-gray-700 dark:bg-gray-800"
      >
        <div className="mb-4 text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('title')}</h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{t('subtitle')}</p>
        </div>

        {/* Pridedame onFocus įvykį į laukus */}
        <div className="text-left">
          <label
            htmlFor="name"
            className="mb-1 block text-sm font-semibold text-gray-700 dark:text-gray-300"
          >
            {t('nameLabel')}
          </label>
          <input
            id="name"
            type="text"
            className="w-full rounded-lg border border-gray-300 px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            placeholder={t('namePlaceholder')}
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            onFocus={handleInputFocus} // <-- Čia įkeliame Turnstile
            required
          />
        </div>

        <div className="text-left">
          <label
            htmlFor="email"
            className="mb-1 block text-sm font-semibold text-gray-700 dark:text-gray-300"
          >
            {t('emailLabel')}
          </label>
          <input
            id="email"
            type="email"
            className="w-full rounded-lg border border-gray-300 px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            placeholder={t('emailPlaceholder')}
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            onFocus={handleInputFocus} // <-- Čia įkeliame Turnstile
            required
          />
        </div>

        <div className="text-left">
          <label
            htmlFor="message"
            className="mb-1 block text-sm font-semibold text-gray-700 dark:text-gray-300"
          >
            {t('messageLabel')}
          </label>
          <textarea
            id="message"
            rows={4}
            className="w-full rounded-lg border border-gray-300 px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            placeholder={t('messagePlaceholder')}
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            onFocus={handleInputFocus} // <-- Čia įkeliame Turnstile
            required
          />
        </div>

        {showTurnstile && (
          <div className="flex justify-center py-2">
            <Turnstile
              siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!}
              onSuccess={(token) => setTurnstileToken(token)}
              options={{
                theme: isDark ? 'dark' : 'light',
                language: currentLocale === 'lt' ? 'lt' : 'en',
              }}
            />
          </div>
        )}

        <button
          type="submit"
          disabled={status === 'loading'}
          className="w-full rounded-lg bg-blue-600 px-4 py-3 font-bold text-white shadow-lg shadow-blue-200 transition hover:bg-blue-700 disabled:opacity-50"
        >
          {status === 'loading' ? t('sending') : t('send')}
        </button>

        {/* ... success/error pranešimai ... */}
      </form>
    </section>
  );
};

export default Contact;
