'use client';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Chatbot from '@/components/Chatbot';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon-16x16.png" sizes="16x16" type="image/png" />
        <link rel="icon" href="/favicon-32x32.png" sizes="32x32" type="image/png" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <script
          nonce={process.env.NEXT_PUBLIC_NONCE}
          dangerouslySetInnerHTML={{
          __html: `
            (function() {
              const saved = localStorage.getItem('theme');
              const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
              if (saved === 'dark' || (!saved && prefersDark)) {
                document.documentElement.classList.add('dark');
              }
            })();
          `
        }} />
      </head>
      <body className="bg-white dark:bg-gray-950">
        <div className="flex flex-col min-h-screen bg-white dark:bg-gray-950 overflow-x-hidden">
          <Navbar />
          <main className="flex-grow w-full pt-16">
            {children}
          </main>
          <Footer />
          <Chatbot />
        </div>
      </body>
    </html>
  );
}
