import {defineRouting} from 'next-intl/routing';
import {createNavigation} from 'next-intl/navigation';

export const routing = defineRouting({
  locales: ['en', 'lt'], // Your supported languages
  defaultLocale: 'en'    // Default language
});

// These helpers make it easy to link to pages without manually adding "/en" or "/lt"
export const {Link, redirect, usePathname, useRouter} = createNavigation(routing);