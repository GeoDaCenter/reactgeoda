import { Provider as ReduxProvider } from "react-redux";
import store from "../store";
import GridLayout from "./GridLayout";
import FileUpload from "./FileUpload";
import React from 'react';
import LanguageSelector from './LanguageSelector';
import IntlProviderWrapper from './IntlProviderWrapper';

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



