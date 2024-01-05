import React from 'react';
import dynamic from 'next/dynamic';
// import ChatGpt from './chatgpt-wrapper';
// import NivoPlot from './nivo-plot';
// import ToolBar from './tool-bar';
// import AgGrid from './ag-grid-wrapper';
import {useSelector} from 'react-redux';
import {GeoDaState} from '../../store';

const DuckDBTable = dynamic(() => import('../table/duckdb-table'), {ssr: false});

export const PanelContainer = () => {
  // get showGridView from redux state
  const showPropertyPanel = useSelector(
    (state: GeoDaState) => state.root.uiState.showPropertyPanel
  );

  return showPropertyPanel ? <div className="prop-box" /> : null;
};
