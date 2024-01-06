'use client';

import {themeLT} from '@kepler.gl/styles';
import {ThemeProvider} from 'styled-components';

export default function ThemeClient({children}: {children: React.ReactNode}) {
  return <ThemeProvider theme={themeLT}>{children}</ThemeProvider>;
}
