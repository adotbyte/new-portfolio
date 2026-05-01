'use client';

export default function ThemeScript({ nonce }: { nonce?: string }) {
  return (
    <script
      nonce={nonce}
      dangerouslySetInnerHTML={{
        __html: `
          (function() {
            try {
              var saved = localStorage.getItem('theme');
              var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
              if (saved === 'dark' || (!saved && prefersDark)) {
                document.documentElement.classList.add('dark');
              }
            } catch (e) {}
          })();
        `,
      }}
    />
  );
}