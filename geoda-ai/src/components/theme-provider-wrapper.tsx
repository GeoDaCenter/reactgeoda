import React from 'react';
import {useDispatch, useSelector} from 'react-redux';

import {GeoDaState} from '../store';
import {ThemeProvider} from 'styled-components';
import {useTheme as useNextTheme} from 'next-themes';
import {themeLT, theme as themeDK} from '@kepler.gl/styles';

type ThemeProviderWrapperProps = {
  children?: React.ReactNode;
};

const ThemeProviderWrapper = ({children}: ThemeProviderWrapperProps) => {
  const {theme} = useNextTheme();
  const dispatch = useDispatch();

  // update state.root.uiState.theme based on the theme
  const themeState = useSelector((state: GeoDaState) => state.root.uiState.theme);
  if (themeState !== theme) {
    // dispatch action to update theme
    dispatch({type: 'SET_THEME', payload: theme === 'light' ? 'dark' : 'light'});
  }

  return <ThemeProvider theme={theme === 'light' ? themeLT : themeDK}>{children}</ThemeProvider>;
};

export default ThemeProviderWrapper;
