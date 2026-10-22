'use client'; // <--- SVARBU: tai turi būti pati pirmoji eilutė

import { useState, useEffect } from 'react';

export default function TerminalWidget() {
  const [liveStats, setLiveStats] = useState<any>(null);

  useEffect(() => {
    fetch('/api/homelab')
      .then(res => res.json())
      .then(data => {
        if (data.stats) setLiveStats(data.stats);
      })
      .catch(console.error);
  }, []);

  return (
    <div className="mt-5 bg-gray-100 dark:bg-slate-900 p-4 rounded-2xl font-mono text-[11px] text-blue-600 dark:text-blue-300 shadow-inner overflow-hidden">
      <div className="flex gap-1.5 mb-2">
        <div className="w-2 h-2 rounded-full bg-red-500/50"></div>
        <div className="w-2 h-2 rounded-full bg-yellow-500/50"></div>
        <div className="w-2 h-2 rounded-full bg-green-500/50"></div>
      </div>
      
      <p>
        <span className="text-gray-400 dark:text-gray-500">$</span>{" "}
        <span className="text-blue-600 dark:text-blue-400">docker ps -q | wc -l</span>
      </p>
      <p className="text-green-600 dark:text-green-400">
        {liveStats?.dockerCount !== undefined ? liveStats.dockerCount : '...'}
      </p>
      
      <p className="mt-1">
        <span className="text-gray-400 dark:text-gray-500">$</span>{" "}
        <span className="text-blue-600 dark:text-blue-400">uptime</span>
      </p>
      <p className="text-gray-600 dark:text-gray-300">
        up {liveStats?.uptimeDays !== undefined ? `${liveStats.uptimeDays} days` : '...'}
      </p>
    </div>
  );
}