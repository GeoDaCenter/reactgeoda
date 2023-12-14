import React from 'react';
import RGL, {Layout, WidthProvider} from 'react-grid-layout';
import dynamic from 'next/dynamic';
import ChatGpt from './chatgpt-wrapper';
import NivoPlot from './nivo-plot';
import ToolBar from './tool-bar';
import AgGrid from './ag-grid-wrapper';

const KeplerMap = dynamic(() => import('./kepler-map'), {ssr: false});
const ReactGridLayout = WidthProvider(RGL);

const layout = [
  {
    w: 7,
    h: 9,
    x: 0,
    y: 0,
    i: 'kepler',
    moved: false,
    static: false
  },
  {
    w: 12,
    h: 6,
    x: 0,
    y: 9,
    i: 'toolbar',
    moved: false,
    static: false
  },
  {
    w: 5,
    h: 9,
    x: 7,
    y: 0,
    i: 'table',
    moved: false,
    static: false
  },
  {
    w: 7,
    h: 10,
    x: 0,
    y: 15,
    i: 'nivoplot',
    moved: false,
    static: false
  },
  {
    w: 4,
    h: 8,
    x: 8,
    y: 15,
    i: 'chatgpt',
    moved: false,
    static: false
  }
];

const GridLayout = () => {
  // File data from Redux store
  // TODO: Call data from redux store from within the grid components instead of here
  // TODO: fix up/implement aggrid

  const styles = {
    gridItem: {
      borderRadius: '5px',
      border: '1px dashed #ddd',
      overflow: 'auto'
    }
  };

  // eslint-disable-next-line no-unused-vars
  const onLayoutChange = (layout: Layout[]) => {
    // ToDo save layout to state
    console.log(layout);
  };

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
