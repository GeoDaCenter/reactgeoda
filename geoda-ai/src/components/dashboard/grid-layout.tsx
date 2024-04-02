import React from 'react';
import RGL, {Layout, WidthProvider} from 'react-grid-layout';
import dynamic from 'next/dynamic';
import {useDispatch, useSelector} from 'react-redux';
import {GeoDaState} from '../../store';
import {Layer} from '@kepler.gl/layers';
import {MAP_ID} from '@/constants';
import {KeplerMapContainer} from '../common/kepler-map-container';
import {GridCell} from './grid-cell';
import {PlotProps} from '@/actions';
import {isBoxPlot, isHistogramPlot, isParallelCoordinate} from '../plots/plot-management';
import {HistogramPlot} from '../plots/histogram-plot';
import {BoxPlot} from '../plots/box-plot';
import {ParallelCoordinatePlot} from '../plots/parallel-coordinate-plot';
import {RegressionProps} from '@/actions/regression-actions';
import {RegressionReport} from '../spreg/spreg-report';
import {hideGridItem, updateLayout} from '@/actions/dashboard-actions';
import {TextCell} from './text-cell';
import {EditorState} from 'lexical/LexicalEditorState';

// import KeplerMap from './kepler-map';
const KeplerMap = dynamic(() => import('../kepler-map'), {ssr: false});
const DuckDBTable = dynamic(() => import('../table/duckdb-table'), {ssr: false});
const ReactGridLayout = WidthProvider(RGL);

const styles = {
  gridItem: {
    // borderRadius: '5px',
    border: '1px dashed #ddd',
    overflow: 'auto'
  }
};

function updateGridLayout(
  gridLayout: Layout[] | undefined,
  gridItems: Array<{id: string; show: boolean}>,
  layers: Layer[],
  plots: PlotProps[],
  regressions: RegressionProps[],
  textItems: Array<{id: string; content: string}>
) {
  // remove items from newGridLayout that are not shwon in gridItem (show: false)
  const newGridLayout = [...(gridLayout || [])];

  // add textItems to newGridLayout if they are not in the newGridLayout
  textItems.forEach(textItem => {
    if (!newGridLayout.find(l => l.i === textItem.id)) {
      newGridLayout.push({
        w: 6,
        h: 2,
        x: 0,
        y: 6 * newGridLayout.length,
        i: textItem.id,
        static: false
      });
    }
  });

  // filter layers that are not in the newGridLayout and are not hidden in gridItems
  const layersNotInLayout = layers?.filter(
    (layer: Layer) => !newGridLayout.find(l => l.i === layer.id)
  );
  // for each layer, create a react grid layout with w: 6 and h: 6
  const layout =
    layersNotInLayout?.map((layer: Layer, index: number) => ({
      w: 6,
      h: 6,
      x: 0,
      y: 6 * index,
      i: layer.id,
      static: false
    })) || [];

  // filter plots that are not in the newGridLayout
  const plotsNotInLayout = plots?.filter(
    (plot: PlotProps) => !newGridLayout.find(l => l.i === plot.id)
  );
  // for each plot, create a react grid layout with w: 6 and h: 6
  const plotLayout =
    plotsNotInLayout?.map((plot: PlotProps, index: number) => ({
      w: 6,
      h: 6,
      x: 6,
      y: 6 * index,
      i: plot.id,
      static: false
    })) || [];

  // filter regressions that are not in the newGridLayout
  const regressionsNotInLayout = regressions?.filter(
    (regression: RegressionProps) => !newGridLayout.find(l => l.i === regression.id)
  );
  // for each regression, create a react grid layout with w: 6 and h: 6
  const regressionLayout =
    regressionsNotInLayout?.map((regression: RegressionProps, index: number) => ({
      w: 6,
      h: 6,
      x: 12,
      y: 6 * index,
      i: regression.id,
      static: false
    })) || [];

  // append layout and plotLayout and regressionLayout to newGridLayout
  const combinedLayout = [...newGridLayout, ...layout, ...plotLayout, ...regressionLayout];

  // add table to combinedLayout if it is not in the newGridLayout
  if (!newGridLayout.find(l => l.i === 'table')) {
    combinedLayout.push({
      w: 6,
      h: 6,
      x: 0,
      y: 6 * (layers?.length || 0),
      i: 'table',
      static: false
    });
  }

  // remove items from combinedLayout that are not shown in gridItem (show: false)
  const combinedLayoutFiltered = combinedLayout.filter(
    (layout: Layout) =>
      !gridItems.find(item => item.id === layout.i) ||
      gridItems.find(item => item.id === layout.i)?.show === true
  );

  return combinedLayoutFiltered;
}

const GridLayout = () => {
  const dispatch = useDispatch();

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

  // get all regressions from redux store
  const regressions = useSelector((state: GeoDaState) => state.root.regressions);

  // get grid layout from redux store
  const gridLayout = useSelector((state: GeoDaState) => state.root.dashboard.gridLayout);

  // get grid items from redux store
  const gridItems = useSelector((state: GeoDaState) => state.root.dashboard.gridItems) || [];

  // get text items from redux store
  const textItems = useSelector((state: GeoDaState) => state.root.dashboard.textItems) || [];

  const layout = updateGridLayout(gridLayout, gridItems, layers, plots, regressions, textItems);

  // when layout changes, update redux state
  const onLayoutChange = (layout: Layout[]) => {
    // only update layout if showGridView is true
    if (showGridView) {
      dispatch(updateLayout({layout}));
    }
  };

  const onCloseGridItem = async (id: string) => {
    // dispatch action to add the grid item in gridItems with show set to false
    dispatch(hideGridItem({id}));
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
      cols={18}
      onLayoutChange={onLayoutChange}
      draggableHandle=".react-grid-dragHandle"
    >
      {layerIds &&
        layerIds.map(
          (layerId: string) =>
            layout.find(l => l.i === layerId) && (
              <div key={layerId} style={styles.gridItem} className={layerId}>
                <GridCell id={layerId} onCloseGridItem={onCloseGridItem}>
                  <KeplerMapContainer layerId={layerId} mapIndex={1} />
                </GridCell>
              </div>
            )
        )}
      {layout.find(l => l.i === 'table') && (
        <div key="table" style={styles.gridItem}>
          <GridCell id="table" onCloseGridItem={onCloseGridItem}>
            <DuckDBTable />
          </GridCell>
        </div>
      )}
      {plotIds &&
        plots.map(
          (plot: PlotProps) =>
            layout.find(l => l.i === plot.id) && (
              <div key={plot.id} style={styles.gridItem}>
                <GridCell id={plot.id} onCloseGridItem={onCloseGridItem}>
                  {isHistogramPlot(plot) && <HistogramPlot key={plot.id} props={plot} />}
                  {isBoxPlot(plot) && <BoxPlot key={plot.id} props={plot} />}
                  {isParallelCoordinate(plot) && (
                    <ParallelCoordinatePlot key={plot.id} props={plot} />
                  )}
                </GridCell>
              </div>
            )
        )}
      {regressions &&
        regressions.map(
          (regression: RegressionProps) =>
            layout.find(l => l.i === regression.id) && (
              <div key={regression.id} style={styles.gridItem}>
                <GridCell id={regression.id} onCloseGridItem={onCloseGridItem}>
                  <RegressionReport key={regression.id} regression={regression} />
                </GridCell>
              </div>
            )
        )}
      {textItems &&
        textItems.map(
          (textItem: {id: string; content: EditorState}) =>
            layout.find(l => l.i === textItem.id) && (
              <div key={textItem.id} style={styles.gridItem}>
                <GridCell id={textItem.id} onCloseGridItem={onCloseGridItem}>
                  <TextCell id={textItem.id} initialState={textItem.content}></TextCell>
                </GridCell>
              </div>
            )
        )}
    </ReactGridLayout>
  );
};

export default GridLayout;
