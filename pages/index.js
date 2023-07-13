import { Provider as ReduxProvider } from "react-redux";
import store from "../store";
import GridLayout from "./GridLayout";
import FileUpload from "./FileUpload";
import React, { useState } from 'react';

export default function Home() {
  const [data, setData] = useState([]);

  const handleFileUpload = (parsedData) => {
    setData(parsedData);
  };

  return (
    <ReduxProvider store={store}>
      <FileUpload onFileUpload={handleFileUpload} />
      <GridLayout data={data} />
    </ReduxProvider>
  );
}


