import { Provider as ReduxProvider } from "react-redux";
import store from "../store";
import GridLayout from "../components/GridLayout";
import FileUpload from "../components/FileUpload";
import React from 'react';
import LanguageSelector from '../components/LanguageSelector';
import IntlProviderWrapper from '../components/IntlProviderWrapper';

export default function Home() {
  return ( 
    <ReduxProvider store={store}>
      <IntlProviderWrapper>
        <LanguageSelector />
        <FileUpload />
        <GridLayout />
      </IntlProviderWrapper>
    </ReduxProvider>
  );
}



