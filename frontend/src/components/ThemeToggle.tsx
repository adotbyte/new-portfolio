'use client';

import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { Monitor, Sun, Moon } from 'lucide-react';

export default function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    if (theme === 'system') setTheme('light');
    else if (theme === 'light') setTheme('dark');
    else setTheme('system');
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
