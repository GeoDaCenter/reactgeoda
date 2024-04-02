import React, {useMemo} from 'react';
import RGL, {Layout, WidthProvider} from 'react-grid-layout';
import dynamic from 'next/dynamic';
import {useDispatch, useSelector} from 'react-redux';
import {GeoDaState} from '../../store';
import {Layer} from '@kepler.gl/layers';
import {MAP_ID} from '@/constants';
import {KeplerMapContainer} from '../common/kepler-map-container';
import {GridCell} from './grid-cell';
import {PlotProps} from '@/actions';
import {PlotWrapper} from '../plots/plot-management';
import {RegressionProps} from '@/actions/regression-actions';
import {RegressionReport} from '../spreg/spreg-report';
import {hideGridItem, updateGridItems, updateLayout} from '@/actions/dashboard-actions';
import {TextCell} from './text-cell';
import {EditorState} from 'lexical/LexicalEditorState';
import {createGridItems, initGridLayout, initGridItems, createGridLayout} from '@/utils/grid-utils';

// import KeplerMap from './kepler-map';
const KeplerMap = dynamic(() => import('../kepler-map'), {ssr: false});
const DuckDBTable = dynamic(() => import('../table/duckdb-table'), {ssr: false});
const ReactGridLayout = WidthProvider(RGL);

const styles = {
  gridItem: {
    // borderRadius: '5px',
    border: '1px dashed #ddd',
    overflow: 'auto'
  },
  displayGridItem: {
    // borderRadius: '5px',
    // border: '1px solid#ddd',
    overflow: 'auto'
  }
};

const GridLayout = () => {
  const dispatch = useDispatch();

  // get showGridView from redux state
  const showGridView = useSelector((state: GeoDaState) => state.root.uiState.showGridView);

  // get all layers from kepler.gl visstate
  const layers = useSelector((state: GeoDaState) => state.keplerGl[MAP_ID]?.visState?.layers);
  const layerIds = layers?.map((layer: Layer) => layer.id);

  // get all plots from redux state
  const plots = useSelector((state: GeoDaState) => state.root.plots);
  const plotIds = plots?.map((plot: any) => plot.id);

  // get all regressions from redux store
  const regressions = useSelector((state: GeoDaState) => state.root.regressions);

  // get mode from redux store
  const mode = useSelector((state: GeoDaState) => state.root.dashboard.mode);
  // get cell style based on mode
  const cellStyle = mode === 'edit' ? styles.gridItem : styles.displayGridItem;

  // get grid layout from redux store
  const gridLayout = useSelector((state: GeoDaState) => state.root.dashboard.gridLayout);

  // get grid items from redux store
  const gridItems = useSelector((state: GeoDaState) => state.root.dashboard.gridItems);

  // get text items from redux store
  const textItems = useSelector((state: GeoDaState) => state.root.dashboard.textItems);

  // update grid layout with grid items
  // const layout = updateGridLayout(gridLayout, gridItems, layers, plots, regressions, textItems);
  const items = useMemo(() => {
    return gridItems
      ? createGridItems({gridLayout, gridItems, layers, plots, regressions, textItems})
      : initGridItems({layers, plots, regressions, textItems});
  }, [gridItems, gridLayout, layers, plots, regressions, textItems]);

  const layout = useMemo(() => {
    return gridItems ? createGridLayout(items, gridLayout) : initGridLayout(items);
  }, [gridItems, gridLayout, items]);

  // when layout changes, update redux state
  const onLayoutChange = (layout: Layout[]) => {
    // only update layout if showGridView is true
    if (showGridView) {
      dispatch(updateLayout({layout}));
      dispatch(updateGridItems(items));
    }
  };

  const onCloseGridItem = async (id: string) => {
    // dispatch action to add the grid item in gridItems with show set to false
    dispatch(hideGridItem({id}));
  };

  const onDrop = (layout: Layout[], layoutItem: Layout, _event: Event) => {
    // only update layout if showGridView is true
    if (showGridView) {
      // @ts-ignore event does not have dataTransfer by react-grid-layout
      const itemId = _event.dataTransfer.getData('text/plain');
      // set the gridItem flag 'show' to true in gridItems
      const newItems = items?.map(item => (item.id === itemId ? {...item, show: true} : item));
      // add the new layoutItem to layout
      const newLayout = [
        ...layout,
        {
          ...layoutItem,
          i: itemId,
          w: 6,
          h: 6,
          static: false
        }
      ];
      // update redux state
      dispatch(updateLayout({layout: newLayout}));
      dispatch(updateGridItems(newItems));
    }
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
      className="layout min-h-[800px]"
      layout={layout}
      rowHeight={30}
      width={1200}
      margin={[20, 20]}
      allowOverlap={true}
      cols={18}
      onLayoutChange={onLayoutChange}
      draggableHandle=".react-grid-dragHandle"
      isResizable={mode === 'edit'}
      isDroppable={mode === 'edit'}
      onDrop={onDrop}
    >
      {layerIds &&
        layerIds.map(
          (layerId: string) =>
            layout.find(l => l.i === layerId) && (
              <div key={layerId} style={cellStyle} className={layerId}>
                <GridCell id={layerId} mode={mode} onCloseGridItem={onCloseGridItem}>
                  <KeplerMapContainer layerId={layerId} mapIndex={1} />
                </GridCell>
              </div>
            )
        )}
      {layout.find(l => l.i === 'table') && (
        <div key="table" style={cellStyle}>
          <GridCell id="table" mode={mode} onCloseGridItem={onCloseGridItem}>
            <DuckDBTable />
          </GridCell>
        </div>
      )}
      {plotIds &&
        plots.map(
          (plot: PlotProps) =>
            layout.find(l => l.i === plot.id) && (
              <div key={plot.id} style={cellStyle}>
                <GridCell id={plot.id} mode={mode} onCloseGridItem={onCloseGridItem}>
                  {PlotWrapper(plot, false)}
                </GridCell>
              </div>
            )
        )}
      {regressions &&
        regressions.map(
          (regression: RegressionProps) =>
            layout.find(l => l.i === regression.id) && (
              <div key={regression.id} style={cellStyle}>
                <GridCell id={regression.id} mode={mode} onCloseGridItem={onCloseGridItem}>
                  <RegressionReport key={regression.id} regression={regression} />
                </GridCell>
              </div>
            )
        )}
      {textItems &&
        textItems.map(
          (textItem: {id: string; content: EditorState}) =>
            layout.find(l => l.i === textItem.id) && (
              <div key={textItem.id} style={cellStyle}>
                <GridCell id={textItem.id} mode={mode} onCloseGridItem={onCloseGridItem}>
                  <TextCell id={textItem.id} mode={mode} initialState={textItem.content}></TextCell>
                </GridCell>
              </div>
            )
        )}
    </ReactGridLayout>
  );
};

export default GridLayout;
