import React from 'react';
import {AgGridReact} from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import {useSelector} from 'react-redux';

type Field = {
  name: string;
  type: string;
};

type Data = {
  fields?: Field[];
  rows?: any[][];
};

type RootState = {
  root: {
    file: {
      fileData: Data;
    };
  };
};

const AgGrid: React.FC = () => {
  const data = useSelector((state: RootState) => state.root.file.fileData);

  // TODO: Fix issue where first row shows [object, object] instead of actual variable names
  const columnDefs = data?.fields
    ? data.fields
        .filter(field => field.type !== 'geojson') // filter out geojson
        .map((field, index) => ({
          headerName: field.name,
          field: index.toString(), // Use the index as the field value
          type: field.type === 'integer' ? 'numericColumn' : undefined // set type only for integer fields
        }))
    : [];

  const rowData = data?.rows
    ? data.rows.map(row =>
        row.reduce((obj, value, index) => {
          obj[index] = value;
          return obj;
        }, {} as Record<number, any>)
      )
    : [];

  return (
    <div
      className="ag-theme-alpine"
      style={{
        height: '500px',
        width: '600px'
      }}
    >
      <AgGridReact rowData={rowData} columnDefs={columnDefs}></AgGridReact>
    </div>
  );
};

export default AgGrid;
