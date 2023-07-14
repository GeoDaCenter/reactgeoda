import { Provider as ReduxProvider } from "react-redux";
import store from "../store";
import GridLayout from "./GridLayout";
import FileUpload from "./FileUpload";
import React, { useState } from 'react';
import { IntlProvider } from "react-intl";

export default function Home() {
  const [data, setData] = useState([]);

  const handleFileUpload = (parsedData) => {
    setData(parsedData);
  };

  return (
    <IntlProvider messages={{}} locale="en" defaultLocale="en">
      <ReduxProvider store={store}>
        <FileUpload onFileUpload={handleFileUpload} />
        <GridLayout data={data} />
      </ReduxProvider>
    </IntlProvider>
  );
}


