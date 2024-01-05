import React from 'react';
import RGL, {Layout, WidthProvider} from 'react-grid-layout';
import dynamic from 'next/dynamic';
// import ChatGpt from './chatgpt-wrapper';
// import NivoPlot from './nivo-plot';
// import ToolBar from './tool-bar';
// import AgGrid from './ag-grid-wrapper';
import {useSelector} from 'react-redux';
import {GeoDaState} from '../store';

import KeplerMap from './kepler-map';
// const KeplerMap = dynamic(() => import('./kepler-map'), {ssr: false});
const DuckDBTable = dynamic(() => import('./table/duckdb-table'), {ssr: false});
const ReactGridLayout = WidthProvider(RGL);

const layout = [
  {
    w: 7,
    h: 9,
    x: 0,
    y: 0,
    i: 'kepler',
    moved: true,
    static: true
  },
  // {
  //   w: 12,
  //   h: 6,
  //   x: 0,
  //   y: 9,
  //   i: 'toolbar',
  //   moved: false,
  //   static: false
  // },
  {
    w: 5,
    h: 9,
    x: 7,
    y: 0,
    i: 'table',
    moved: false,
    static: false
  }
  // {
  //   w: 7,
  //   h: 10,
  //   x: 0,
  //   y: 15,
  //   i: 'nivoplot',
  //   moved: false,
  //   static: false
  // },
  // {
  //   w: 4,
  //   h: 8,
  //   x: 8,
  //   y: 15,
  //   i: 'chatgpt',
  //   moved: false,
  //   static: false
  // }
];

const styles = {
  gridItem: {
    borderRadius: '5px',
    border: '1px dashed #ddd',
    overflow: 'auto'
  }
};

const GridLayout = () => {
  // get showGridView from redux state
  const showGridView = useSelector((state: GeoDaState) => state.root.uiState.showGridView);

  // eslint-disable-next-line no-unused-vars
  const onLayoutChange = (layout: Layout[]) => {
    // ToDo save layout to state
    console.log(layout);
  };

  if (!showGridView) {
    // only show map
    return (
      <ReactGridLayout
        className="default-kepler-map"
        layout={[{w: 12, h: 9, x: 0, y: 0, i: 'kepler', moved: false, static: true}]}
        rowHeight={30}
        width={1200}
        margin={[0, 0]}
        allowOverlap={false}
        onLayoutChange={onLayoutChange}
      >
        <div key="kepler" className="default-kepler-map">
          <KeplerMap />
        </div>
      </ReactGridLayout>
    );
  }

  return (
    <ReactGridLayout
      className="layout"
      layout={layout}
      rowHeight={30}
      width={1200}
      margin={[20, 20]}
      allowOverlap={false}
      onLayoutChange={onLayoutChange}
    >
      <div key="kepler" style={styles.gridItem}>
        <KeplerMap />
      </div>
      <div key="table" style={styles.gridItem}>
        {/* <DuckDBTable /> */}
      </div>
      {/*<div key="toolbar" style={styles.gridItem}>
        <ToolBar />
      </div>
      <div key="table" style={styles.gridItem}>
        <AgGrid />
      </div>
      <div key="nivoplot" style={styles.gridItem}>
        <NivoPlot />
      </div>
      <div key="chatgpt" style={styles.gridItem}>
        <ChatGpt />
      </div> */}
    </ReactGridLayout>
  );
};

export default GridLayout;
