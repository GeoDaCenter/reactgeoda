'use client';

import React from 'react';
import {themeLT} from '@kepler.gl/styles';
import {ThemeProvider} from 'styled-components';
import {ThemeProvider as NextThemesProvider} from 'next-themes';

export default function ThemeClient({children}: {children: React.ReactNode}) {
  return (
    <ThemeProvider theme={themeLT}>
      <NextThemesProvider attribute="class" defaultTheme="light">
        {children}
      </NextThemesProvider>
    </ThemeProvider>
  );
}
