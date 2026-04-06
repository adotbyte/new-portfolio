'use client';
import { useState } from 'react';

const services = [
  { name: 'adguardhome', desc: 'DNS-level ad & tracker blocking', category: 'Network', icon: '🛡️', status: 'running' },
  { name: 'alloy', desc: 'Grafana Alloy metrics collector', category: 'Monitoring', icon: '📊', status: 'running' },
  { name: 'cadvisor', desc: 'Container resource usage & performance', category: 'Monitoring', icon: '📈', status: 'running' },
  { name: 'cf-managed-beacon', desc: 'Cloudflare managed tunnel beacon', category: 'Network', icon: '☁️', status: 'running' },
  { name: 'cloudflared', desc: 'Cloudflare Zero Trust tunnel daemon', category: 'Network', icon: '🔒', status: 'running' },
  { name: 'directus-app', desc: 'Headless CMS application layer', category: 'Apps', icon: '🗂️', status: 'running' },
  { name: 'directus-cache', desc: 'Redis cache for Directus CMS', category: 'Apps', icon: '⚡', status: 'running' },
  { name: 'directus-db', desc: 'PostgreSQL database for Directus', category: 'Apps', icon: '🗄️', status: 'running' },
  { name: 'dockhand', desc: 'Docker container management UI', category: 'System', icon: '🐳', status: 'running' },
  { name: 'hbbr', desc: 'RustDesk relay server', category: 'Remote', icon: '🔗', status: 'running' },
  { name: 'hbbs', desc: 'RustDesk signaling server', category: 'Remote', icon: '📡', status: 'running' },
  { name: 'resume_website', desc: 'This portfolio — Next.js + Django', category: 'Apps', icon: '🚀', status: 'running' },
  { name: 'rustdesk_bridge', desc: 'RustDesk network bridge', category: 'Remote', icon: '🌉', status: 'running' },
  { name: 'searxng', desc: 'Privacy-first meta search engine', category: 'Apps', icon: '🔍', status: 'running' },
  { name: 'searxng-valkey', desc: 'Valkey cache for SearXNG', category: 'Apps', icon: '⚡', status: 'running' },
  { name: 'tailscale', desc: 'Mesh VPN for secure remote access', category: 'Network', icon: '🔐', status: 'running' },
  { name: 'webtop', desc: 'Browser-based Linux desktop', category: 'System', icon: '🖥️', status: 'running' },
  { name: 'wireguard', desc: 'WireGuard VPN server', category: 'Network', icon: '🛡️', status: 'running' },
];

const categories = ['All', 'Network', 'Monitoring', 'Apps', 'System', 'Remote'];

const categoryColors: Record<string, string> = {
  Network: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
  Monitoring: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300',
  Apps: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
  System: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300',
  Remote: 'bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300',
};

export default function HomeLab() {
  const [activeCategory, setActiveCategory] = useState('All');

  const filtered = activeCategory === 'All'
    ? services
    : services.filter(s => s.category === activeCategory);

  const stats = {
    containers: services.length,
    storage: '4TB NVMe',
    ram: '16GB',
    uptime: '99.9%',
  };

  return (
    <section className="w-full bg-white dark:bg-gray-950 py-12 overflow-x-hidden">
      <div className="w-full max-w-7xl mx-auto px-6 md:px-8">

        {/* Header */}
        <div className="mb-12 flex items-center gap-6">
          <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight whitespace-nowrap">
            🏠 Home Lab
          </h1>
          <div className="h-[1px] flex-grow bg-gray-100 dark:bg-gray-800"></div>
          <span className="text-xs font-mono text-gray-400 dark:text-gray-500 whitespace-nowrap">Raspberry Pi 5</span>
        </div>

        {/* Hardware Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {[
            { label: 'Device', value: 'Raspberry Pi 5', icon: '🖥️' },
            { label: 'RAM', value: stats.ram, icon: '💾' },
            { label: 'Storage', value: stats.storage, icon: '💿' },
            { label: 'Containers', value: `${stats.containers} running`, icon: '🐳' },
          ].map((stat) => (
            <div key={stat.label} className="bg-slate-50 dark:bg-gray-800 rounded-2xl p-5 border border-slate-100 dark:border-gray-700 flex flex-col gap-1">
              <span className="text-2xl">{stat.icon}</span>
              <span className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{stat.label}</span>
              <span className="text-sm font-black text-gray-900 dark:text-white">{stat.value}</span>
            </div>
          ))}
        </div>

        {/* Storage detail */}
        <div className="mb-10 p-5 bg-blue-50 dark:bg-blue-950 rounded-2xl border border-blue-100 dark:border-blue-900">
          <p className="text-sm font-bold text-blue-900 dark:text-blue-200 flex items-center gap-2">
            <span>💿</span>
            Storage: <span className="font-medium ml-1">2× 2TB NVMe SSD in software RAID for redundancy & performance</span>
          </p>
        </div>

        {/* Services */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-black text-gray-900 dark:text-white">Docker Services</h2>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            <span className="text-xs font-bold text-green-600 dark:text-green-400">{services.length} running</span>
          </div>
        </div>

        {/* Category filter */}
        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                activeCategory === cat
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 dark:shadow-blue-900'
                  : 'bg-slate-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-slate-200 dark:hover:bg-gray-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Services grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((service, i) => (
            <div
              key={service.name}
              className="group bg-slate-50 dark:bg-gray-800 rounded-2xl p-5 border border-slate-100 dark:border-gray-700 hover:border-blue-200 dark:hover:border-blue-700 hover:shadow-lg hover:shadow-blue-50 dark:hover:shadow-blue-950 transition-all duration-300 hover:-translate-y-1"
              style={{ animationDelay: `${i * 30}ms` }}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="text-xl">{service.icon}</span>
                  <div>
                    <p className="font-mono text-sm font-bold text-gray-900 dark:text-white">{service.name}</p>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${categoryColors[service.category]}`}>
                      {service.category}
                    </span>
                  </div>
                </div>
                <span className="w-2 h-2 bg-green-500 rounded-full mt-1 shrink-0"></span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{service.desc}</p>
            </div>
          ))}
        </div>

        {/* Terminal footer */}
        <div className="mt-12 bg-gray-100 dark:bg-slate-900 rounded-2xl p-6 font-mono text-sm border border-gray-200 dark:border-gray-700">
          <div className="flex gap-1.5 mb-4">
            <div className="w-3 h-3 rounded-full bg-red-500/60"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500/60"></div>
            <div className="w-3 h-3 rounded-full bg-green-500/60"></div>
          </div>
          <div className="space-y-1 text-xs">
            <p><span className="text-gray-400 dark:text-gray-500">$</span> <span className="text-blue-600 dark:text-blue-400">docker ps</span> <span className="text-gray-500">--format "table"</span></p>
            <p className="text-green-600 dark:text-green-400">✓ {services.length} containers running</p>
            <p><span className="text-gray-400 dark:text-gray-500">$</span> <span className="text-blue-600 dark:text-blue-400">uptime</span></p>
            <p className="text-gray-600 dark:text-gray-300">up 247 days, load average: 0.42, 0.38, 0.35</p>
            <p><span className="text-gray-400 dark:text-gray-500">$</span> <span className="text-blue-600 dark:text-blue-400">free -h</span></p>
            <p className="text-gray-600 dark:text-gray-300">Mem: <span className="text-white">16G</span> total, 8.2G used, 7.8G free</p>
            <p className="text-blue-600 dark:text-blue-400 animate-pulse">█</p>
          </div>
        </div>

      </div>
    </section>
  );
}
