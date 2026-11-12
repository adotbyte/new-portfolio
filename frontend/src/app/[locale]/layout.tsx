import '../globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import BackToTop from '@/components/BackToTop';
import ThemeScript from '@/components/ThemeScript';
import ThemeSync from '@/components/ThemeSync';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import { notFound } from 'next/navigation';
import { headers } from 'next/headers';
import { ThemeProvider } from '@/components/theme-provider';
import type { Metadata } from 'next';

// @next-codemod-ignore Cache Components adoption: this segment temporarily allows blocking.
// Remove this opt-out after verifying the segment passes validation without it.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

const BASE_URL = 'https://morkunas.info';
const DEFAULT_LOCALE = 'lt';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

// Dinaminis metadata generavimas kiekvienai kalbai
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;

  // Nustatome canonical URL: numatytajai kalbai (lt) - be prefikso,
  // kitoms kalboms - su prefiksu
  const canonicalUrl =
    locale === DEFAULT_LOCALE ? BASE_URL : `${BASE_URL}/${locale}`;

  // Sukuriame hreflang alternatyvas visoms kalboms
  const languages: Record<string, string> = {};
  routing.locales.forEach((loc) => {
    languages[loc] = loc === DEFAULT_LOCALE ? BASE_URL : `${BASE_URL}/${loc}`;
  });

  return {
    metadataBase: new URL(BASE_URL),
    alternates: {
      canonical: canonicalUrl,
      languages,
    },
    icons: {
      icon: [
        { url: '/favicon.ico', sizes: 'any' },
        { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
        { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      ],
      apple: '/apple-touch-icon.png',
    },
    manifest: '/site.webmanifest',
    other: {
      'color-scheme': 'light dark',
      'fb:app_id': '914320204924075',
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // Validate that the incoming `[locale]` is supported
  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  // Fetch messages on the server
  const nonce = (await headers()).get('x-nonce') ?? undefined;
  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className="bg-white dark:bg-gray-950">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem nonce={nonce}>
          <ThemeSync />
          <NextIntlClientProvider messages={messages}>
            <div className="flex min-h-screen flex-col overflow-x-hidden bg-white dark:bg-gray-950">
              <Navbar />
              <main className="w-full flex-grow pt-16">{children}</main>
              <Footer />
              <BackToTop />
            </div>
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}