import React from 'react';
import {AgGridReact} from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';

const AgGrid = ({data}) => {
  // Check if data exists and it is an array with at least one object
  const columnDefs =
    data && data.length > 0 ? Object.keys(data[0]).map(key => ({headerName: key, field: key})) : [];

  return (
    <div
      className="ag-theme-alpine"
      style={{
        height: '500px',
        width: '600px'
      }}
    >
      <AgGridReact columnDefs={columnDefs} rowData={data}></AgGridReact>
    </div>
  );
};

export default AgGrid;
