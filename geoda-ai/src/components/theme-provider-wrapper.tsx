import React from 'react';
import {useSelector} from 'react-redux';

import {GeoDaState} from '../store';
import {ThemeProvider} from 'styled-components';
import {themeLT, theme as themeDK} from '@kepler.gl/styles';

type ThemeProviderWrapperProps = {
  children?: React.ReactNode;
};

const ThemeProviderWrapper = ({children}: ThemeProviderWrapperProps) => {
  const theme = useSelector((state: GeoDaState) => state.root.uiState.theme || 'light');

  return <ThemeProvider theme={theme === 'light' ? themeLT : themeDK}>{children}</ThemeProvider>;
};

export default ThemeProviderWrapper;
