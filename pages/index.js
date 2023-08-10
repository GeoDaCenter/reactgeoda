import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import {Provider as ReduxProvider} from 'react-redux';
import React from 'react';
import store from '../store';
import GridLayout from '../components/GridLayout';
import FileHandler from '../components/FileHandler';
import LanguageSelector from '../components/LanguageSelector';
import IntlProviderWrapper from '../components/IntlProviderWrapper';
import {Demo} from '../components/Demo';

export default function Home() {
  return (
    <ReduxProvider store={store}>
      <IntlProviderWrapper>
        <Demo />
        <LanguageSelector />
        <FileHandler />
        <GridLayout />
      </IntlProviderWrapper>
    </ReduxProvider>
  );
}
