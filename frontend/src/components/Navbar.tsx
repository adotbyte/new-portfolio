'use client';
import { useState, useEffect, useLayoutEffect } from 'react';
import { useTheme } from 'next-themes';
import { useTranslations } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/routing';
import { useParams } from 'next/navigation';
import { Monitor, Sun, Moon } from 'lucide-react';

const Navbar = () => {
  const t = useTranslations('nav');
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const currentLocale = params.locale as string;

  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('about');

  const navLinks = [
    { name: t('about'), href: '#about', id: 'about' },
    { name: t('portfolio'), href: '#portfolio', id: 'portfolio' },
    { name: t('services') || 'Paslaugos', href: '/services', id: 'services' },
    { name: t('blog') || 'Tinklaraštis', href: '/blog', id: 'blog' },
    { name: t('caseStudies') || 'Atvejai', href: '/case-studies', id: 'case-studies' },
    { name: t('homeLab'), href: '#homelab', id: 'homelab' },
    { name: t('contact'), href: '#contact', id: 'contact' },
  ];

  const [mounted, setMounted] = useState(false);
  const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

  useIsomorphicLayoutEffect(() => {
    setMounted(true);
  }, []);

  const switchLocale = (locale: string) => {
    router.replace(pathname, { locale });
  };

  useEffect(() => {
    if (pathname === '/services') {
      setActiveSection('services');
      return;
    }
    if (pathname === '/blog' || pathname.startsWith('/blog/')) {
      setActiveSection('blog');
      return;
    }
    if (pathname === '/case-studies') {
      setActiveSection('case-studies');
      return;
    }

    if (pathname !== '/') {
      setActiveSection('');
      return;
    }

    const sections = ['about', 'portfolio', 'homelab', 'contact'];

    const handleScroll = () => {
      const navHeight = 64;
      const offset = navHeight + 16;

      const contactEl = document.getElementById('contact');
      if (contactEl) {
        const rect = contactEl.getBoundingClientRect();
        if (rect.top <= window.innerHeight * 0.5) {
          setActiveSection('contact');
          return;
        }
      }

      let currentSection = 'about';
      let closestDistance = Infinity;

      for (const id of sections) {
        const el = document.getElementById(id);
        if (!el) continue;
        const rect = el.getBoundingClientRect();
        const distance = Math.abs(rect.top - offset);

        if (rect.top <= offset + 10 && distance < closestDistance) {
          closestDistance = distance;
          currentSection = id;
        }
      }
      setActiveSection(currentSection);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [pathname]);

  useEffect(() => {
    if (pathname === '/' && window.location.hash) {
      const id = window.location.hash.replace('#', '');
      const el = document.getElementById(id);
      if (el) {
        setTimeout(() => {
          const navHeight = 64;
          const elementPosition = el.getBoundingClientRect().top + window.scrollY;
          window.scrollTo({
            top: elementPosition - navHeight - 16,
            behavior: 'smooth',
          });
          window.history.replaceState(null, '', window.location.pathname);
        }, 100);
      }
    }
  }, [pathname]);

  const toggleDark = () => {
    if (theme === 'system') setTheme('light');
    else if (theme === 'light') setTheme('dark');
    else setTheme('system');
  };

  const scrollTo = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();

    if (href.startsWith('/')) {
      router.push(href);
      setIsOpen(false);
      return;
    }

    const id = href.replace('#', '');

    if (pathname !== '/') {
      router.push(`/#${id}`);
      setIsOpen(false);
      return;
    }

    const el = document.getElementById(id);

    if (el) {
      const navHeight = 64;
      const elementPosition = el.getBoundingClientRect().top + window.scrollY;
      const offsetPosition = elementPosition - navHeight - 16;

      window.history.replaceState(null, '', window.location.pathname + window.location.search);

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
    setIsOpen(false);
  };

  return (
    <nav className="fixed left-0 right-0 top-0 z-50 bg-white/90 shadow-sm backdrop-blur-md dark:bg-gray-900/90">
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex h-16 items-center justify-between">
          <a
            href="#about"
            onClick={(e) => scrollTo(e, '#about')}
            className="flex-shrink-0 text-xl font-bold tracking-tighter text-blue-600 md:text-2xl"
          >
            Audrius Morkūnas Portfolio
          </a>

          <div className="hidden items-center space-x-6 lg:flex">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={(e) => scrollTo(e, link.href)}
                className={`cursor-pointer font-medium transition-colors ${
                  activeSection === link.id
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-600 hover:text-blue-600 dark:text-gray-300'
                }`}
              >
                {link.name}
              </a>
            ))}

            <div className="flex items-center gap-1 text-sm font-semibold">
              <button
                onClick={() => switchLocale('en')}
                className={`rounded px-2 py-1 transition-colors ${currentLocale === 'en' ? 'text-blue-600' : 'text-gray-600 hover:text-blue-600'}`}
              >
                EN
              </button>
              <span className="text-gray-300 dark:text-gray-600">|</span>
              <button
                onClick={() => switchLocale('lt')}
                className={`rounded px-2 py-1 transition-colors ${currentLocale === 'lt' ? 'text-blue-600' : 'text-gray-600 hover:text-blue-600'}`}
              >
                LT
              </button>
            </div>

            <button
              onClick={toggleDark}
              aria-label="Toggle theme"
              className={`relative flex h-9 w-9 items-center justify-center rounded-lg text-gray-600 transition-opacity duration-300 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 ${
                mounted ? 'opacity-100' : 'opacity-0'
              }`}
            >
              {mounted && (
                <>
                  {theme === 'system' && <Monitor className="h-5 w-5" />}
                  {theme === 'light' && <Sun className="h-5 w-5" />}
                  {theme === 'dark' && <Moon className="h-5 w-5" />}
                </>
              )}
            </button>
          </div>

          <div className="flex items-center gap-2 lg:hidden">
            <div className="flex items-center gap-1 text-xs font-semibold">
              <button
                onClick={() => switchLocale('en')}
                className={`rounded px-1.5 py-1 ${currentLocale === 'en' ? 'text-blue-600' : 'text-gray-600'}`}
              >
                EN
              </button>
              <span className="text-gray-300">|</span>
              <button
                onClick={() => switchLocale('lt')}
                className={`rounded px-1.5 py-1 ${currentLocale === 'lt' ? 'text-blue-600' : 'text-gray-600'}`}
              >
                LT
              </button>
            </div>

            <button
              onClick={toggleDark}
              aria-label="Toggle theme"
              className={`relative flex h-9 w-9 items-center justify-center rounded-lg text-gray-600 transition-opacity duration-300 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 ${
                mounted ? 'opacity-100' : 'opacity-0'
              }`}
            >
              {mounted && (
                <>
                  {theme === 'system' && <Monitor className="h-5 w-5" />}
                  {theme === 'light' && <Sun className="h-5 w-5" />}
                  {theme === 'dark' && <Moon className="h-5 w-5" />}
                </>
              )}
            </button>

            <button
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Toggle menu"
              className="rounded-md p-2 text-blue-600 transition-colors hover:bg-blue-50"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div
        className={`${isOpen ? 'block' : 'hidden'} border-t border-gray-100 bg-white dark:border-gray-800 dark:bg-gray-900 lg:hidden`}
      >
        <div className="space-y-1 px-4 pb-6 pt-2 shadow-xl">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              onClick={(e) => scrollTo(e, link.href)}
              className={`block cursor-pointer rounded-md px-3 py-4 text-lg font-medium ${
                activeSection === link.id
                  ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-blue-600 dark:text-gray-300 dark:hover:bg-gray-800'
              }`}
            >
              {link.name}
            </a>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
