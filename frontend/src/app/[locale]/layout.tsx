import '../globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Chatbot from '@/components/Chatbot';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { routing } from '@/i18n/routing'; // Ensure this path is correct
import { notFound } from 'next/navigation';
import ThemeScript from '@/components/ThemeScript';
import { headers } from 'next/headers';

export default async function LocaleLayout({
  children,
  params
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
  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon-16x16.png" sizes="16x16" type="image/png" />
        <link rel="icon" href="/favicon-32x32.png" sizes="32x32" type="image/png" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <ThemeScript />
      </head>
      <body className="bg-white dark:bg-gray-950">
        <NextIntlClientProvider messages={messages}>
          <div className="flex flex-col min-h-screen bg-white dark:bg-gray-950 overflow-x-hidden">
            <Navbar />
            <main className="flex-grow w-full pt-16">
              {children}
            </main>
            <Footer />
            <Chatbot />
          </div>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}