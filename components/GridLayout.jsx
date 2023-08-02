import React from 'react';
import RGL, {WidthProvider} from 'react-grid-layout';
import dynamic from 'next/dynamic';
import ChatGpt from './ChatGpt';
import NivoPlot from './NivoPlot';
import ToolBar from './ToolBar';
import AgGrid from './AgGrid';

const ChoroplethMap = dynamic(() => import('./ChoroplethMap'), {ssr: false});
const LocalMoran = dynamic(() => import('./LocalMoran'), {ssr: false});
const KeplerMap = dynamic(() => import('./KeplerMap'), {ssr: false});
const ReactGridLayout = WidthProvider(RGL);

const layout = [
  {i: 'kepler', x: 0, y: 0, w: 7, h: 8, static: true},
  {i: 'toolbar', x: 10, y: 0, w: 5, h: 5, static: true},
  {i: 'table', x: 14, y: 12, w: 5, h: 14},
  {i: 'nivoplot', x: 10, y: 14, w: 7, h: 10},
  {i: 'chatgpt', x: 10, y: 14, w: 5, h: 8},
  {i: 'choropleth', x: 0, y: 21, w: 5, h: 8, static: true},
  {i: 'local-moran', x: 10, y: 42, w: 5, h: 8, static: true}
];

const GridLayout = () => {
  // File data from Redux store
  // TODO: Call data from redux store from within the grid components instead of here
  // TODO: fix up/implement aggrid

  return (
    <ReactGridLayout className="layout" layout={layout} rowHeight={30} width={1200}>
      <div key="kepler">
        <KeplerMap />
      </div>
      <div key="toolbar">
        <ToolBar />
      </div>
      <div key="table">
        <AgGrid />
      </div>
      <div key="nivoplot">
        <NivoPlot />
      </div>
      <div key="chatgpt">
        <ChatGpt />
      </div>
      <div key="choropleth">
        <ChoroplethMap />
      </div>
      <div key="local-moran">
        <LocalMoran />
      </div>
    </ReactGridLayout>
  );
};

export default GridLayout;
