import { defineRouting } from 'next-intl/routing';
import { createNavigation } from 'next-intl/navigation';

export const routing = defineRouting({
  locales: ['lt', 'en'], // Your supported languages
  defaultLocale: 'lt', // Default language
  localePrefix: 'as-needed',
});

// These helpers make it easy to link to pages without manually adding "/en" or "/lt"
export const { Link, redirect, usePathname, useRouter } = createNavigation(routing);
