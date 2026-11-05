'use client';

import { useState, useEffect } from 'react';
import { Monitor, Sun, Moon } from 'lucide-react';

export default function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const [theme, setTheme] = useState<'system' | 'light' | 'dark'>('system');

  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem('theme') as 'system' | 'light' | 'dark' | null;
    if (savedTheme) {
      setTheme(savedTheme);
    } else {
      setTheme('system');
    }
  }, []);

  const toggleTheme = () => {
    let nextTheme: 'system' | 'light' | 'dark';
    if (theme === 'system') nextTheme = 'light';
    else if (theme === 'light') nextTheme = 'dark';
    else nextTheme = 'system';

    setTheme(nextTheme);
    localStorage.setItem('theme', nextTheme);

    const root = document.documentElement;
    root.classList.remove('light', 'dark');

    if (nextTheme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
      root.classList.add(systemTheme);
    } else {
      root.classList.add(nextTheme);
    }
  };

  if (!mounted) {
    return (
      <button
        aria-label="Toggle theme"
        className="relative flex h-9 w-9 items-center justify-center rounded-lg text-gray-600 opacity-0"
      >
        <div className="h-5 w-5" />
      </button>
    );
  }

  return (
    <button
      onClick={toggleTheme}
      aria-label="Toggle theme"
      className="relative flex h-9 w-9 items-center justify-center rounded-lg text-gray-600 transition-all duration-700 ease-out hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
    >
      {theme === 'system' && <Monitor className="h-5 w-5" />}
      {theme === 'light' && <Sun className="h-5 w-5" />}
      {theme === 'dark' && <Moon className="h-5 w-5" />}
    </button>
  );
}
