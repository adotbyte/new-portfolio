// src/components/theme-provider.tsx
'use client';

import * as React from 'react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';

if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  const originalError = console.error;
  console.error = (...args: unknown[]) => {
    const errorMessage = typeof args[0] === 'string' ? args[0] : '';
    // Slopiname tiek script tag, tiek hydration mismatch klaidas, kurias sukelia next-themes
    if (
      errorMessage.includes('Encountered a script tag while rendering React component') ||
      errorMessage.includes(
        "A tree hydrated but some attributes of the server rendered HTML didn't match"
      ) ||
      errorMessage.includes('Hydration failed because the server rendered HTML')
    ) {
      return;
    }
    originalError.apply(console, args);
  };
}

export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
