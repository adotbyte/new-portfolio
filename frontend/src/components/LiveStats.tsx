'use client';

import { useTranslations } from 'next-intl';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

export default function LiveStats() {
  const t = useTranslations('liveStats');
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const grafanaTheme = resolvedTheme === 'dark' ? 'dark' : 'light';

  return (
    <div className="mt-12 w-full overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
      <div className="border-b border-gray-200 p-4 dark:border-gray-700">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">📊 {t('title')}</h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{t('subtitle')}</p>
      </div>

      <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
        <iframe
          src={`https://grafana.morkunas.info/d/adz87gw/portfolio-live-stats?orgId=1&kiosk&theme=${grafanaTheme}`}
          className="absolute inset-0 h-full w-full border-0"
          allowFullScreen
          sandbox="allow-scripts allow-same-origin"
        />
      </div>
    </div>
  );
}
