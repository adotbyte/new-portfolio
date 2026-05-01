'use client';
import { useState, useEffect } from 'react';
import { Turnstile } from '@marsidev/react-turnstile';
import { useTranslations } from 'next-intl';

const Contact = () => {
  const t = useTranslations('contact');
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const check = () => setIsDark(document.documentElement.classList.contains('dark'));
    check();
    const observer = new MutationObserver(check);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!turnstileToken) { alert(t('captchaError')); return; }
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
    <section className="min-h-[80vh] flex items-center justify-center px-6 bg-white dark:bg-gray-950">
      <form onSubmit={handleSubmit} className="w-full max-w-md p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 space-y-6">
        <div className="text-center mb-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('title')}</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t('subtitle')}</p>
        </div>

        <div className="text-left">
          <label htmlFor="name" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">{t('nameLabel')}</label>
          <input id="name" type="text"
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder={t('namePlaceholder')}
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required />
        </div>

        <div className="text-left">
          <label htmlFor="email" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">{t('emailLabel')}</label>
          <input id="email" type="email"
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder={t('emailPlaceholder')}
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required />
        </div>

        <div className="text-left">
          <label htmlFor="message" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">{t('messageLabel')}</label>
          <textarea id="message" rows={4}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder={t('messagePlaceholder')}
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            required />
        </div>

        <button type="submit" disabled={status === 'loading'}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition disabled:opacity-50 shadow-lg shadow-blue-200">
          {status === 'loading' ? t('sending') : t('send')}
        </button>

        <div className="flex justify-center py-2">
          <Turnstile
            siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!}
            onSuccess={(token) => setTurnstileToken(token)}
            options={{ theme: isDark ? 'dark' : 'light' }}
          />
        </div>

        {status === 'success' && (
          <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <p className="text-green-600 dark:text-green-400 text-center text-sm font-medium">{t('success')}</p>
          </div>
        )}
        {status === 'error' && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-600 dark:text-red-400 text-center text-sm font-medium">{t('error')}</p>
          </div>
        )}
      </form>
    </section>
  );
};

export default Contact;