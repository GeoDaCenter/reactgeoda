import { Provider as ReduxProvider } from "react-redux";
import store from "../store";
import GridLayout from "../components/GridLayout";
import FileHandler from "../components/FileHandler";
import React from 'react';
import LanguageSelector from '../components/LanguageSelector';
import IntlProviderWrapper from '../components/IntlProviderWrapper';

export default function Home() {
  return ( 
    <ReduxProvider store={store}>
      <IntlProviderWrapper>
        <LanguageSelector />
        <FileHandler />
        <GridLayout />
      </IntlProviderWrapper>
    </ReduxProvider>
  );
}



