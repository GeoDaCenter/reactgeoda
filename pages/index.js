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
import {Navigator} from '../components/navigator';

export default function Home() {
  return (
    <ReduxProvider store={store}>
      <IntlProviderWrapper>
        <div className="react-geoda">
          <Navigator />
          <div className="main-box">
            <div className="main-grid">
              <Demo />
              <LanguageSelector />
              <FileHandler />
              <GridLayout />
            </div>
          </div>
          <div className="prop-box" />
        </div>
      </IntlProviderWrapper>
    </ReduxProvider>
  );
}
