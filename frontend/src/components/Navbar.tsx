'use client';
import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { useTranslations } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/routing';
import { useParams } from 'next/navigation';

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
    { name: t('homeLab'), href: '#homelab', id: 'homelab' },
    { name: t('contact'), href: '#contact', id: 'contact' },
  ];

  const switchLocale = (locale: string) => {
    router.replace(pathname, { locale });
  };

  useEffect(() => {
    // 1. Jei esame Paslaugų arba Blog puslapyje, pažymime juos
    if (pathname === '/services') {
      setActiveSection('services');
      return;
    }
    if (pathname === '/blog' || pathname.startsWith('/blog/')) {
      setActiveSection('blog');
      return;
    }

    // 2. Jei esame bet kuriame kitame atskirame puslapyje
    if (pathname !== '/') {
      setActiveSection('');
      return;
    }

    // 3. Jei esame pagrindiniame puslapyje, vykdome įprastą scroll logiką
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

  // Šis efektas leidžia nuslinkti į sekciją, kai grįžtama iš kito puslapio (pvz., /#about)
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
          // Išvalome hash iš URL, kad nešokinėtų
          window.history.replaceState(null, '', window.location.pathname);
        }, 100);
      }
    }
  }, [pathname]);

  const toggleDark = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const scrollTo = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();

    // 1. Jei tai atskiras puslapis (pvz., /services)
    if (href.startsWith('/')) {
      router.push(href);
      setIsOpen(false);
      return;
    }

    const id = href.replace('#', '');

    // 2. Jei esame ne pagrindiniame puslapyje, o norime eiti į sekciją
    if (pathname !== '/') {
      router.push(`/#${id}`); // Pereiname į pagrindinį puslapį su hash'u
      setIsOpen(false);
      return;
    }

    // 3. Jei esame pagrindiniame puslapyje – slenkame kaip įprastai
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

  const MoonIcon = () => (
    <svg
      className="block h-5 w-5 dark:hidden"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
      />
    </svg>
  );

  const SunIcon = () => (
    <svg
      className="hidden h-5 w-5 dark:block"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z"
      />
    </svg>
  );

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

          <div className="hidden items-center space-x-8 md:flex">
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
                className={`rounded px-2 py-1 transition-colors ${currentLocale === 'en' ? 'text-blue-600' : 'text-gray-400 hover:text-blue-600'}`}
              >
                EN
              </button>
              <span className="text-gray-300 dark:text-gray-600">|</span>
              <button
                onClick={() => switchLocale('lt')}
                className={`rounded px-2 py-1 transition-colors ${currentLocale === 'lt' ? 'text-blue-600' : 'text-gray-400 hover:text-blue-600'}`}
              >
                LT
              </button>
            </div>

            <button
              onClick={toggleDark}
              aria-label="Toggle dark mode"
              className="rounded-lg p-2 text-gray-600 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              <SunIcon />
              <MoonIcon />
            </button>
          </div>

          <div className="flex items-center gap-2 md:hidden">
            <div className="flex items-center gap-1 text-xs font-semibold">
              <button
                onClick={() => switchLocale('en')}
                className={`rounded px-1.5 py-1 ${currentLocale === 'en' ? 'text-blue-600' : 'text-gray-400'}`}
              >
                EN
              </button>
              <span className="text-gray-300">|</span>
              <button
                onClick={() => switchLocale('lt')}
                className={`rounded px-1.5 py-1 ${currentLocale === 'lt' ? 'text-blue-600' : 'text-gray-400'}`}
              >
                LT
              </button>
            </div>

            <button
              onClick={toggleDark}
              aria-label="Toggle dark mode"
              className="rounded-lg p-2 text-gray-600 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              <SunIcon />
              <MoonIcon />
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
        className={`${isOpen ? 'block' : 'hidden'} border-t border-gray-100 bg-white dark:border-gray-800 dark:bg-gray-900 md:hidden`}
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
