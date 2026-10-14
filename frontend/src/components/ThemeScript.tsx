// src/components/ThemeScript.tsx
export default function ThemeScript({ nonce }: { nonce?: string }) {
  return (
    <script
      nonce={nonce}
      suppressHydrationWarning
      dangerouslySetInnerHTML={{
        __html: `
          (function() {
            try {
              var saved = localStorage.getItem('theme');
              var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
              var isDark = saved === 'dark' || (!saved && prefersDark);
              var root = document.documentElement;
              root.classList.toggle('dark', isDark);
              console.log('theme script ran:', document.documentElement.className);
            } catch (e) {}
          })();
        `,
      }}
    />
  );
}