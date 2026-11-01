'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useTheme } from 'next-themes';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export default function LiveStats() {
  const t = useTranslations('liveStats');
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [data, setData] = useState<{ time: string; cpu: number; ram: number }[]>([]);

  useEffect(() => {
    setMounted(true);

    const fetchData = async () => {
      try {
        const res = await fetch('/api/prometheus');
        const json = await res.json();

        const cpu = Number(json.cpu);
        const ram = Number(json.ram);

        if (isNaN(cpu) || isNaN(ram)) {
          console.warn('Invalid metrics received:', json);
          return;
        }

        const now = new Date().toLocaleTimeString('lt-LT', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        });

        setData((prev) => {
          // Suapvaliname: CPU iki 1 skaičiaus po kablelio, RAM iki sveiko skaičiaus
          const newData = [
            ...prev,
            {
              time: now,
              cpu: Math.round(cpu * 10) / 10, // pvz., 12.9
              ram: Math.round(ram), // pvz., 3384
            },
          ];
          return newData.slice(-20);
        });
      } catch (err) {
        console.error('Failed to fetch metrics:', err);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 5000); // Kas 5 sekundes
    return () => clearInterval(interval);
  }, []);

  if (!mounted) return null;

  const isDark = resolvedTheme === 'dark';
  const strokeColor = isDark ? '#60a5fa' : '#2563eb';
  const gridColor = isDark ? '#374151' : '#e5e7eb';

  return (
    <div className="mt-12 w-full overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
      <div className="border-b border-gray-200 p-4 dark:border-gray-700">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">📊 {t('title')}</h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{t('subtitle')}</p>
      </div>

      <div className="p-4" style={{ height: '300px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
            <XAxis dataKey="time" stroke={isDark ? '#9ca3af' : '#6b7280'} fontSize={12} />

            {/* Kairė Y ašis – CPU (%) */}
            <YAxis
              yAxisId="left"
              stroke={isDark ? '#9ca3af' : '#6b7280'}
              fontSize={12}
              domain={[0, 100]}
              tickFormatter={(value) => `${value}%`}
            />

            {/* Dešinė Y ašis – RAM (MB) */}
            <YAxis
              yAxisId="right"
              orientation="right"
              stroke={isDark ? '#9ca3af' : '#6b7280'}
              fontSize={12}
              tickFormatter={(value) => (value >= 1000 ? `${(value / 1000).toFixed(1)}k` : value)}
            />

            <Tooltip
              contentStyle={{
                backgroundColor: isDark ? '#1f2937' : '#ffffff',
                borderColor: isDark ? '#374151' : '#e5e7eb',
                color: isDark ? '#f3f4f6' : '#111827',
              }}
              formatter={(value: any, name: any) => {
                if (name === 'CPU (%)') return [`${Number(value).toFixed(1)} %`, 'CPU'];
                if (name === 'RAM (MB)') return [`${Number(value).toFixed(0)} MB`, 'RAM'];
                return [value, name];
              }}
            />

            {/* CPU linija – naudoja kairę ašį */}
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="cpu"
              stroke={strokeColor}
              strokeWidth={2}
              dot={false}
              name="CPU (%)"
            />

            {/* RAM linija – naudoja dešinę ašį */}
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="ram"
              stroke="#10b981"
              strokeWidth={2}
              dot={false}
              name="RAM (MB)"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
