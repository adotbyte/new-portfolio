'use client';

import { useTranslations } from 'next-intl';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

export default function LiveStats() {
  const t = useTranslations('liveStats');
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Kad išvengtume hidratacijos klaidos, komponentą rodome tik po to, kai jis "užsikrauna" kliente
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null; // Arba galite grąžinti skeleton loader

  // Nustatome Grafanos temą pagal svetainės temą
  const grafanaTheme = resolvedTheme === 'dark' ? 'dark' : 'light';

  return (
    <div className="mt-12 w-full overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
      <div className="border-b border-gray-200 p-4 dark:border-gray-700">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
          📊 Live from the Home Lab
        </h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Real-time metrics from my Raspberry Pi 5 and the services running on it.
        </p>
      </div>

      <div className="relative w-full" style={{ paddingBottom: '56.25%' /* 16:9 proporcija */ }}>
        <iframe
          // Pridedame &theme=light arba &theme=dark prie URL
          src={`https://grafana.morkunas.info/d/adz87gw/portfolio-live-stats?orgId=1&kiosk&theme=${grafanaTheme}`}
          className="absolute inset-0 h-full w-full border-0"
          allowFullScreen
          sandbox="allow-scripts allow-same-origin"
        />
      </div>
    </div>
  );
}
