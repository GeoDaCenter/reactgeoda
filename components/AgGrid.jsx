import React from 'react';
import {AgGridReact} from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import {useSelector} from 'react-redux';
import AutoSizer from 'react-virtualized-auto-sizer';

const AgGrid = () => {
  const data = useSelector(state => state.root.file.fileData);

  // Check if data and data.fields exist before mapping
  // TODO: Fix issue where first row shows [object, object] instead of actual variable names
  const columnDefs =
    data && data.fields
      ? data.fields
          .filter(field => field.type !== 'geojson') // filter out geojson
          .map((field, index) => ({
            headerName: field.name,
            field: index.toString(), // Use the index as the field value
            type: field.type === 'integer' ? 'numericColumn' : undefined // set type only for integer fields
          }))
      : [];

  // Transform rows from array to object
  const rowData =
    data && data.rows
      ? data.rows.map(row =>
          row.reduce((obj, value, index) => {
            obj[index] = value;
            return obj;
          }, {})
        )
      : [];

  return (
    <AutoSizer>
      {({height, width}) => (
        <div
          className="ag-theme-alpine"
          style={{
            height: `${height}px`,
            width: `${width}px`,
            padding: '16px'
          }}
        >
          <AgGridReact rowData={rowData} columnDefs={columnDefs}></AgGridReact>
        </div>
      )}
    </AutoSizer>
  );
};

export default AgGrid;
