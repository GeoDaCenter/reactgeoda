import React from 'react';
import RGL, {Layout, WidthProvider} from 'react-grid-layout';
import dynamic from 'next/dynamic';
import {useSelector} from 'react-redux';
import {GeoDaState} from '../store';
import {Layer} from '@kepler.gl/layers';
import {MAP_ID} from '@/constants';
import {KeplerMapContainer} from './common/kepler-map-container';
import {GridCell} from './common/grid-cell';
import {PlotProps} from '@/actions';
import {isBoxPlot, isHistogramPlot, isParallelCoordinate} from './plots/plot-management';
import {HistogramPlot} from './plots/histogram-plot';
import {BoxPlot} from './plots/box-plot';
import {ParallelCoordinatePlot} from './plots/parallel-coordinate-plot';
import {RegressionProps} from '@/actions/regression-actions';
import {RegressionReport} from './spreg/spreg-report';

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
    // borderRadius: '5px',
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

  // get all plots from redux state
  const plots = useSelector((state: GeoDaState) => state.root.plots);
  // get plot ids from redux state
  const plotIds = plots?.map((plot: any) => plot.id);

  // get all regressions from redux state
  const regressions = useSelector((state: GeoDaState) => state.root.regressions);

  // for each layer, create a react grid layout with w: 6 and h: 6
  const layout =
    layerIds?.map((layerId: string, index: number) => ({
      w: 6,
      h: 6,
      x: 0,
      y: 6 * index,
      i: layerId,
      moved: false,
      static: false
    })) || [];

  // for each plot, create a react grid layout with w: 6 and h: 6
  const plotLayout =
    plotIds?.map((plotId: string, index: number) => ({
      w: 6,
      h: 6,
      x: 6,
      y: 6 * index,
      i: plotId,
      moved: false,
      static: false
    })) || [];

  // for each regression, create a react grid layout with w: 6 and h: 6
  const regressionLayout =
    regressions?.map((regression: any, index: number) => ({
      w: 6,
      h: 6,
      x: 12,
      y: 6 * index,
      i: regression.id,
      moved: false,
      static: false
    })) || [];

  // combine layout and plotLayout and regressionLayout
  const combinedLayout = [...layout, ...plotLayout, ...regressionLayout];

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
      layout={combinedLayout}
      rowHeight={30}
      width={1200}
      margin={[20, 20]}
      allowOverlap={false}
      onLayoutChange={onLayoutChange}
      draggableHandle=".react-grid-dragHandle"
    >
      {layerIds &&
        layerIds.map((layerId: string) => (
          <div key={layerId} style={styles.gridItem}>
            <GridCell key={layerId}>
              <KeplerMapContainer layerId={layerId} mapIndex={1} />
            </GridCell>
          </div>
        ))}
      {plotIds &&
        plots.map((plot: PlotProps) => (
          <div key={plot.id} style={styles.gridItem}>
            <GridCell key={plot.id}>
              {isHistogramPlot(plot) && <HistogramPlot key={plot.id} props={plot} />}
              {isBoxPlot(plot) && <BoxPlot key={plot.id} props={plot} />}
              {isParallelCoordinate(plot) && <ParallelCoordinatePlot key={plot.id} props={plot} />}
            </GridCell>
          </div>
        ))}
      {regressions &&
        regressions.map((regression: RegressionProps) => (
          <div key={regression.id} style={styles.gridItem}>
            <GridCell key={regression.id}>
              <RegressionReport key={regression.id} regression={regression} />
            </GridCell>
          </div>
        ))}
    </ReactGridLayout>
  );
};

export default GridLayout;
