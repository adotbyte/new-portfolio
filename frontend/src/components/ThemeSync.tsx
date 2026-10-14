'use client';
import { useLayoutEffect } from 'react';

export default function ThemeSync() {
  // Runs before paint on every mount, including after a locale switch
  useLayoutEffect(() => {
    try {
      const saved = localStorage.getItem('theme');
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const isDark = saved === 'dark' || (!saved && prefersDark);
      document.documentElement.classList.toggle('dark', isDark);
    } catch {}
  }, []);

  return null;
}