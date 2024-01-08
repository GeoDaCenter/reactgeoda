import React from 'react';
import dynamic from 'next/dynamic';
// import ChatGpt from './chatgpt-wrapper';
// import NivoPlot from './nivo-plot';
// import ToolBar from './tool-bar';
// import AgGrid from './ag-grid-wrapper';
import {useSelector} from 'react-redux';
import {GeoDaState} from '../../store';

const DuckDBTable = dynamic(() => import('./duckdb-table'), {ssr: false});

export const TableContainer = () => {
  // get showGridView from redux state
  const showTable = useSelector((state: GeoDaState) => state.root.uiState.showKeplerTableModal);

  // get table name
  const tableName = useSelector((state: GeoDaState) => state.root.file?.rawFileData?.name);

  return showTable && tableName ? (
    <div className="main-table">
      <DuckDBTable />
    </div>
  ) : null;
};
