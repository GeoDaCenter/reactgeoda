'use client';

import React from 'react';
import {ThemeProvider as NextThemesProvider} from 'next-themes';

export default function ThemeClient({children}: {children: React.ReactNode}) {
  return (
    <NextThemesProvider attribute="class" defaultTheme="dark">
      {children}
    </NextThemesProvider>
  );
}
