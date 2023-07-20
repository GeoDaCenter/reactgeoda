import React from 'react';
import { useSelector } from 'react-redux';
import RGL, { WidthProvider } from "react-grid-layout";
import dynamic from "next/dynamic";
import ChatGpt from './ChatGpt';
import ReactTable from './ReactTable'
import AgGrid from './AgGrid'
import NivoPlot from './NivoPlot';
import EChartsPlot from './EChartsPlot';
import ToolBar from './ToolBar'
// import JsGeoda from './JsGeoda'

const KeplerMap = dynamic(() => import("./KeplerMap"), { ssr: false });
const ReactGridLayout = WidthProvider(RGL);

const layout = [
  { i: "a", x: 0, y: 0, w: 7, h: 21, static: true }, // Kepler Map
  { i: "b", x: 10, y: 0, w: 5, h: 5, static: true }, // Toolbar
  { i: "c", x: 14, y: 12, w: 5, h: 17 }, // react table
  // { i: "d", x: 0, y: 21, w: 3, h: 13, static: true }, // Ag Grid
  { i: "e", x: 0, y: 14, w: 7, h: 10 }, // Nivo Plot
  // { i: "f", x: 10, y: 14, w: 5, h: 10 }, // Apache ECharts Plot
  { i: "g", x: 10, y: 14, w: 5, h: 8 }, // ChatGPT
  { i: "h", x: 10, y: 14, w: 5, h: 8 }, // JSGEODA test
];

const GridLayout = () => {
  // For debugging redux state

  // File data from Redux store
  const data = useSelector(state => state.root.file.fileData); // TODO: Call data from redux store from within the grid components instead of here

  
  // Set Kepler Map size
  const [mapDimensions, setMapDimensions] = React.useState({
    width: 800,    // window.innnerWidth
    height: 800, // window.innnerHeight
  });

  return (
    <ReactGridLayout
      className="layout"
      layout={layout}
      rowHeight={30}
      width={1200}
    >
      <div key="a">
        <KeplerMap
          data={data}
          width={mapDimensions.width}
          height={mapDimensions.height}
        />
      </div>
      <div key="b">
        <ToolBar data={data} />
      </div>
      <div key="c">
        <ReactTable data={data} /> 
      </div>
      {/* <div key="d">
        <AgGrid data={data} />
      </div> */}
      <div key="e">
        <NivoPlot data={data} />
      </div>
      {/* <div key="f">
        <EChartsPlot data={data} />
      </div> */}
      <div key="g">
        <ChatGpt data={data} />
      </div>
      <div key="h">
        h
      </div>
    </ReactGridLayout>
  );
};

export default GridLayout;
