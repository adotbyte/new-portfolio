'use client';
import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import InteractiveTerminal from './InteractiveTerminal';

const categoryColors: Record<string, string> = {
  Network: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
  Monitoring: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300',
  Apps: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
  System: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300',
  Remote: 'bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300',
  Media: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
};

const categories = ['All', 'Network', 'Monitoring', 'Apps', 'System', 'Remote', 'Media'];

export default function HomeLab() {
  const t = useTranslations('homeLab');
  const [activeCategory, setActiveCategory] = useState('All');
  const [services, setServices] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/homelab')
      .then((res) => res.json())
      .then((data) => {
        if (data.devices && data.devices.length > 0) {
          setServices(data.devices[0].services);
        }
        setStats(data.stats);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error loading homelab data:', err);
        setLoading(false);
      });
  }, []);

  const filtered =
    activeCategory === 'All' ? services : services.filter((s) => s.category === activeCategory);
  const totalContainers = stats?.dockerCount || services.length;

  return (
    <section className="w-full overflow-x-hidden bg-white py-12 dark:bg-gray-950">
      <div className="mx-auto w-full max-w-7xl px-6 md:px-8">
        <div className="mb-12 flex items-center gap-6">
          <h1 className="whitespace-nowrap text-3xl font-black tracking-tight text-gray-900 dark:text-white">
            {t('title')}
          </h1>
          <div className="h-[1px] flex-grow bg-gray-100 dark:bg-gray-800"></div>
          <span className="whitespace-nowrap font-mono text-xs text-gray-400 dark:text-gray-500">
            Raspberry Pi 5
          </span>
        </div>

        <div className="mb-12 grid grid-cols-2 gap-4 md:grid-cols-4">
          {[
            { label: t('device'), value: 'Raspberry Pi 5', icon: '🖥️' },
            { label: t('ram'), value: '16GB', icon: '💾' },
            { label: t('storage'), value: '4TB NVMe', icon: '💿' },
            {
              label: t('containers'),
              value: `${totalContainers}+ ${t('containersRunning')}`,
              icon: '🐳',
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="flex flex-col gap-1 rounded-2xl border border-slate-100 bg-slate-50 p-5 dark:border-gray-700 dark:bg-gray-800"
            >
              <span className="text-2xl">{stat.icon}</span>
              <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                {stat.label}
              </span>
              <span className="text-sm font-black text-gray-900 dark:text-white">{stat.value}</span>
            </div>
          ))}
        </div>

        <div className="mb-10 rounded-2xl border border-blue-100 bg-blue-50 p-5 dark:border-blue-900 dark:bg-blue-950">
          <p className="flex items-center gap-2 text-sm font-bold text-blue-900 dark:text-blue-200">
            <span>💿</span>
            {t('storageDetail')} <span className="ml-1 font-medium">{t('storageDetailText')}</span>
          </p>
        </div>

        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-black text-gray-900 dark:text-white">
            {t('dockerServices')}
          </h2>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 animate-pulse rounded-full bg-green-500"></span>
            <span className="text-xs font-bold text-green-600 dark:text-green-400">
              {t('showingTop', { count: services.length, total: totalContainers })}
            </span>
          </div>
        </div>

        <div className="mb-8 flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`rounded-full px-4 py-1.5 text-xs font-bold transition-all ${
                activeCategory === cat
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 dark:shadow-blue-900'
                  : 'bg-slate-100 text-gray-600 hover:bg-slate-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700'
              }`}
            >
              {cat === 'All' ? t('filterAll') : cat}
            </button>
          ))}
        </div>

        {/* --- SKELETON effect start here --- */}
        <div className="grid min-h-[200px] grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="h-32 animate-pulse rounded-2xl border border-slate-200 bg-slate-100 dark:border-gray-700 dark:bg-gray-800/50"
                ></div>
              ))
            : filtered.map((service, i) => (
                <div
                  key={service.name}
                  className="group rounded-2xl border border-slate-100 bg-slate-50 p-5 transition-all duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg hover:shadow-blue-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:border-blue-700 dark:hover:shadow-blue-950"
                  style={{ animationDelay: `${i * 30}ms` }}
                >
                  <div className="mb-3 flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">
                        {service.category === 'Media'
                          ? '🎬'
                          : service.category === 'Network'
                            ? '🌐'
                            : service.category === 'Monitoring'
                              ? '📊'
                              : service.category === 'System'
                                ? '⚙️'
                                : service.category === 'Remote'
                                  ? '🔗'
                                  : '📦'}
                      </span>
                      <div>
                        <p className="font-mono text-sm font-bold text-gray-900 dark:text-white">
                          {service.name}
                        </p>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${categoryColors[service.category] || 'bg-gray-100 text-gray-700'}`}
                        >
                          {service.category}
                        </span>
                      </div>
                    </div>
                    <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-green-500"></span>
                  </div>
                  <p className="text-xs leading-relaxed text-gray-500 dark:text-gray-400">
                    Port: {service.port}
                  </p>
                </div>
              ))}
        </div>
        {/* --- SKELETON effect end here --- */}
        <InteractiveTerminal />
        {/*<div className="mt-12 rounded-2xl border border-gray-200 bg-gray-100 p-6 font-mono text-sm dark:border-gray-700 dark:bg-slate-900">
          <div className="mb-4 flex gap-1.5">
            <div className="h-3 w-3 rounded-full bg-red-500/60"></div>
            <div className="h-3 w-3 rounded-full bg-yellow-500/60"></div>
            <div className="h-3 w-3 rounded-full bg-green-500/60"></div>
          </div>
          <div className="space-y-1 text-xs">
            <p>
              <span className="text-gray-400 dark:text-gray-500">$</span>{' '}
              <span className="text-blue-600 dark:text-blue-400">{t('terminal.dockerCmd')}</span>
            </p>
            <p className="text-green-600 dark:text-green-400">
              ✓ {stats?.dockerCount || 0} {t('terminal.dockerResult')}
            </p>

            <p>
              <span className="text-gray-400 dark:text-gray-500">$</span>{' '}
              <span className="text-blue-600 dark:text-blue-400">{t('terminal.uptimeCmd')}</span>
            </p>
            <p className="text-gray-600 dark:text-gray-300">
              {t('terminal.uptimeResult', {
                days: stats?.uptimeDays || 0,
                load: stats?.load || '0.00, 0.00, 0.00',
              })}
            </p>

            <p>
              <span className="text-gray-400 dark:text-gray-500">$</span>{' '}
              <span className="text-blue-600 dark:text-blue-400">{t('terminal.freeCmd')}</span>
            </p>
            <p className="text-gray-600 dark:text-gray-300">
              {t('terminal.freeTotal', {
                total: stats?.memory?.total || '16G',
                used: stats?.memory?.used || '8.2G',
                free: stats?.memory?.free || '7.8G',
              })}
            </p>

            <p className="animate-pulse text-blue-600 dark:text-blue-400">█</p>
          </div>
        </div>*/}
      </div>
    </section>
  );
}
