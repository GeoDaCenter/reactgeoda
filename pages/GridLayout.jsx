import React from "react";
import RGL, { WidthProvider } from "react-grid-layout";
import dynamic from "next/dynamic";
import ChatGpt from './ChatGpt';
import ReactTable from './ReactTable'
import AgGrid from './AgGrid'
import NivoPlot from './NivoPlot';
import EChartsPlot from './EChartsPlot';

const KeplerMap = dynamic(() => import("./KeplerMap"), { ssr: false });

const ReactGridLayout = WidthProvider(RGL);

const layout = [
  { i: "a", x: 0, y: 0, w: 4, h: 21, static: true }, // Kepler Map
  { i: "b", x: 10, y: 0, w: 3, h: 12 }, // ChatGPT
  { i: "c", x: 14, y: 0, w: 5, h: 12 }, // react table
  { i: "d", x: 4, y: 0, w: 3, h: 13 }, // Ag Grid
  { i: "e", x: 4, y: 14, w: 5, h: 10 }, // Nivo Plot
  { i: "f", x: 10, y: 14, w: 5, h: 10 }, // Apache ECharts Plot
];

const GridLayout = ({ data }) => {

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
        <ChatGpt data={data} />
      </div>
      <div key="c">
        <ReactTable data={data} /> 
      </div>
      <div key="d">
        <AgGrid data={data} />
      </div>
      <div key="e">
        <NivoPlot data={data} />
      </div>
      <div key="f">
        <EChartsPlot data={data} />
      </div>
    </ReactGridLayout>
  );
};

export default GridLayout;


