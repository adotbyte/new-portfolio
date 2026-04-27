'use client';
import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/routing';
import { useParams } from 'next/navigation';

const Navbar = () => {
  const t = useTranslations('nav');
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const currentLocale = params.locale as string;

  const [isOpen, setIsOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [activeSection, setActiveSection] = useState('about');

  const navLinks = [
    { name: t('about'),     href: '#about',     id: 'about'     },
    { name: t('portfolio'), href: '#portfolio',  id: 'portfolio' },
    { name: t('homeLab'),   href: '#homelab',    id: 'homelab'   },
    { name: t('contact'),   href: '#contact',    id: 'contact'   },
  ];

  const switchLocale = (locale: string) => {
    router.replace(pathname, { locale });
  };

  useEffect(() => {
    const saved = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const dark = saved ? saved === 'dark' : prefersDark;
    setIsDark(dark);
    document.documentElement.classList.toggle('dark', dark);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const sections = ['about', 'portfolio', 'homelab', 'contact'];
      const scrollY = window.scrollY + 100;
      for (const id of sections) {
        const el = document.getElementById(id);
        if (el && scrollY >= el.offsetTop && scrollY < el.offsetTop + el.offsetHeight) {
          setActiveSection(id);
          break;
        }
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleDark = () => {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle('dark', next);
    localStorage.setItem('theme', next ? 'dark' : 'light');
  };

  const scrollTo = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const id = href.replace('#', '');
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
    setIsOpen(false);
  };

  const MoonIcon = () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
    </svg>
  );

  const SunIcon = () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
    </svg>
  );

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md shadow-sm overflow-hidden">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">

          <a href="#about" onClick={(e) => scrollTo(e, '#about')}
            className="flex-shrink-0 font-bold text-xl md:text-2xl text-blue-600 tracking-tighter">
            Audrius Morkūnas Portfolio
          </a>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <a key={link.name} href={link.href} onClick={(e) => scrollTo(e, link.href)}
                className={`font-medium transition-colors cursor-pointer ${
                  activeSection === link.id
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 dark:text-gray-300 hover:text-blue-600'
                }`}>
                {link.name}
              </a>
            ))}

            {/* Language switcher */}
            <div className="flex items-center gap-1 text-sm font-semibold">
              <button
                onClick={() => switchLocale('en')}
                className={`px-2 py-1 rounded transition-colors ${
                  currentLocale === 'en'
                    ? 'text-blue-600'
                    : 'text-gray-400 hover:text-blue-600'
                }`}>
                EN
              </button>
              <span className="text-gray-300 dark:text-gray-600">|</span>
              <button
                onClick={() => switchLocale('lt')}
                className={`px-2 py-1 rounded transition-colors ${
                  currentLocale === 'lt'
                    ? 'text-blue-600'
                    : 'text-gray-400 hover:text-blue-600'
                }`}>
                LT
              </button>
            </div>

            <button onClick={toggleDark} aria-label="Toggle dark mode"
              className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              {isDark ? <SunIcon /> : <MoonIcon />}
            </button>
          </div>

          {/* Mobile controls */}
          <div className="md:hidden flex items-center gap-2">
            {/* Mobile language switcher */}
            <div className="flex items-center gap-1 text-xs font-semibold">
              <button
                onClick={() => switchLocale('en')}
                className={`px-1.5 py-1 rounded ${
                  currentLocale === 'en' ? 'text-blue-600' : 'text-gray-400'
                }`}>
                EN
              </button>
              <span className="text-gray-300">|</span>
              <button
                onClick={() => switchLocale('lt')}
                className={`px-1.5 py-1 rounded ${
                  currentLocale === 'lt' ? 'text-blue-600' : 'text-gray-400'
                }`}>
                LT
              </button>
            </div>

            <button onClick={toggleDark} aria-label="Toggle dark mode"
              className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              {isDark ? <SunIcon /> : <MoonIcon />}
            </button>

            <button onClick={() => setIsOpen(!isOpen)} aria-label="Toggle menu"
              className="p-2 rounded-md text-blue-600 hover:bg-blue-50 transition-colors">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isOpen
                  ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`${isOpen ? 'block' : 'hidden'} md:hidden bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800`}>
        <div className="px-4 pt-2 pb-6 space-y-1 shadow-xl">
          {navLinks.map((link) => (
            <a key={link.name} href={link.href} onClick={(e) => scrollTo(e, link.href)}
              className={`block px-3 py-4 rounded-md font-medium text-lg cursor-pointer ${
                activeSection === link.id
                  ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/20'
                  : 'text-gray-600 dark:text-gray-300 hover:text-blue-600 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}>
              {link.name}
            </a>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;