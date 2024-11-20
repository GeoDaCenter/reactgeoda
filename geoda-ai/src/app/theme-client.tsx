'use client';

import React from 'react';
import {ThemeProvider as NextThemesProvider} from 'next-themes';

export default function ThemeClient({
  children,
  theme = 'dark'
}: {
  children: React.ReactNode;
  theme?: string;
}) {
  return (
    <NextThemesProvider attribute="class" defaultTheme={theme}>
      {children}
    </NextThemesProvider>
  );
}
