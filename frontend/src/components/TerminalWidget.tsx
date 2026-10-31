'use client'; 

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';

export default function TerminalWidget() {
  const t = useTranslations('TerminalWidget');
  const [liveStats, setLiveStats] = useState<any>(null);

  useEffect(() => {
    fetch('/api/homelab')
      .then((res) => res.json())
      .then((data) => {
        if (data.stats) setLiveStats(data.stats);
      })
      .catch(console.error);
  }, []);

  return (
    <div className="mt-5 overflow-hidden rounded-2xl bg-gray-100 p-4 font-mono text-[11px] text-blue-600 shadow-inner dark:bg-slate-900 dark:text-blue-300">
      <div className="mb-2 flex gap-1.5">
        <div className="h-2 w-2 rounded-full bg-red-500/50"></div>
        <div className="h-2 w-2 rounded-full bg-yellow-500/50"></div>
        <div className="h-2 w-2 rounded-full bg-green-500/50"></div>
      </div>

      <p>
        <span className="text-gray-400 dark:text-gray-500">$</span>{' '}
        <span className="text-blue-600 dark:text-blue-400">docker ps -q | wc -l</span>
      </p>
<p className="text-green-600 dark:text-green-400">
  {liveStats?.dockerCount !== undefined 
    ? `${liveStats.dockerCount} ${t('dockerContainers')}` 
    : '...'}
</p>

      <p className="mt-1">
        <span className="text-gray-400 dark:text-gray-500">$</span>{' '}
        <span className="text-blue-600 dark:text-blue-400">uptime</span>
      </p>
<p className="text-gray-600 dark:text-gray-300">
  {t('uptime', { days: liveStats?.uptimeDays !== undefined ? liveStats.uptimeDays : '...' })}
</p>
    </div>
  );
}
