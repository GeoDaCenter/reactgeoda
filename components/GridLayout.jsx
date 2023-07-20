import React from 'react';
import {useSelector} from 'react-redux';
import RGL, {WidthProvider} from 'react-grid-layout';
import dynamic from 'next/dynamic';
import ChatGpt from './ChatGpt';
import ReactTable from './ReactTable';
import NivoPlot from './NivoPlot';
import ToolBar from './ToolBar';
//import JsGeoda from './JsGeoda';

const KeplerMap = dynamic(() => import('./KeplerMap'), {ssr: false});
const ReactGridLayout = WidthProvider(RGL);

const layout = [
  {i: 'kepler', x: 0, y: 0, w: 7, h: 21, static: true}, // Kepler Map
  {i: 'toolbar', x: 10, y: 0, w: 5, h: 5, static: true}, // Toolbar
  {i: 'table', x: 14, y: 12, w: 5, h: 17}, // react table
  {i: 'nivoplot', x: 0, y: 14, w: 7, h: 10}, // Nivo Plot
  {i: 'chatgpt', x: 10, y: 14, w: 5, h: 8}, // ChatGPT
  {i: 'jsgeoda', x: 10, y: 14, w: 5, h: 8} // JSGEODA test
];

const GridLayout = () => {
  // File data from Redux store
  const data = useSelector(state => state.root.file.fileData); // TODO: Call data from redux store from within the grid components instead of here

  // Set Kepler Map size
  const mapDimensions = {
    width: 800, // window.innerWidth
    height: 800 // window.innerHeight
  };

  return (
    <ReactGridLayout className="layout" layout={layout} rowHeight={30} width={1200}>
      <div key="kepler">
        <KeplerMap data={data} width={mapDimensions.width} height={mapDimensions.height} />
      </div>
      <div key="toolbar">
        <ToolBar data={data} />
      </div>
      <div key="table">
        <ReactTable data={data} />
      </div>
      <div key="nivoplot">
        <NivoPlot data={data} />
      </div>
      <div key="chatgpt">
        <ChatGpt data={data} />
      </div>
      <div key="jsgeoda">h</div>
    </ReactGridLayout>
  );
};

export default GridLayout;
