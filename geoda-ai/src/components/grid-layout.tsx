import React from 'react';
import RGL, {Layout, WidthProvider} from 'react-grid-layout';
import dynamic from 'next/dynamic';
import {useSelector} from 'react-redux';
import {GeoDaState} from '../store';
import {Layer} from '@kepler.gl/layers';
import {MAP_ID} from '@/constants';
import {KeplerMapContainer} from './common/kepler-map-container';

// import KeplerMap from './kepler-map';
const KeplerMap = dynamic(() => import('./kepler-map'), {ssr: false});
// const DuckDBTable = dynamic(() => import('./table/duckdb-table'), {ssr: false});
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

  // get all layers from kepler.gl visstate
  const layers = useSelector((state: GeoDaState) => state.keplerGl[MAP_ID]?.visState?.layers);
  // get layer ids from kepler.gl visstate
  const layerIds = layers?.map((layer: Layer) => layer.id);

  // for each layer, create a react grid layout with w: 6 and h: 6
  const layout = layerIds?.map((layerId: string, index: number) => ({
    w: 6,
    h: 6,
    x: 0,
    y: 6 * index,
    i: layerId,
    moved: false,
    static: false
  }));

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
      {layerIds &&
        layerIds.map((layerId: string, i: number) => (
          <div key={layerId} className="overflow-auto rounded-sm border-dashed border-gray-500 p-4">
            <KeplerMapContainer layerId={layerId} mapIndex={i + 1} mapWidth={280} mapHeight={180} />
          </div>
        ))}
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
