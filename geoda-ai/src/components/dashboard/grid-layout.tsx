import React, {useMemo} from 'react';
import RGL, {Layout, WidthProvider} from 'react-grid-layout';
import dynamic from 'next/dynamic';
import {useDispatch, useSelector} from 'react-redux';
import {GeoDaState} from '../../store';
import {MAP_ID} from '@/constants';
import {KeplerMapContainer} from '../common/kepler-map-container';
import {GridCell} from './grid-cell';
import {PlotWrapper} from '../plots/plot-management';
import {RegressionReport} from '../spreg/spreg-report';
import {addTextGridItem, updateGridItems, updateLayout} from '@/actions/dashboard-actions';
import {getEditorState, TextCell} from './text-cell';
import {
  createGridItems,
  initGridLayout,
  initGridItems,
  createGridLayout,
  GRID_ITEM_TYPES
} from '@/utils/grid-utils';
import {WeightsMetaTable} from '@/components/weights/weights-meta-table';

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
  // get all plots from redux state
  const plots = useSelector((state: GeoDaState) => state.root.plots);
  // get all regressions from redux store
  const regressions = useSelector((state: GeoDaState) => state.root.regressions);
  // get all weights from redux store
  const weights = useSelector((state: GeoDaState) => state.root.weights);
  // get mode from redux store
  const mode = useSelector((state: GeoDaState) => state.root.dashboard.mode);
  // get grid layout from redux store
  const gridLayout = useSelector((state: GeoDaState) => state.root.dashboard.gridLayout);
  // get grid items from redux store
  const gridItems = useSelector((state: GeoDaState) => state.root.dashboard.gridItems);
  // get text items from redux store
  const textItems = useSelector((state: GeoDaState) => state.root.dashboard.textItems);

  // get cell style based on mode
  const cellStyle = mode === 'edit' ? styles.gridItem : styles.displayGridItem;
  // get theme from redux store
  const theme = useSelector((state: GeoDaState) => state.root.uiState.theme);

  // update grid layout with grid items
  // const layout = updateGridLayout(gridLayout, gridItems, layers, plots, regressions, textItems);
  const items = useMemo(() => {
    return gridItems
      ? createGridItems({gridLayout, gridItems, layers, plots, regressions, textItems, weights})
      : initGridItems({layers, plots, regressions, textItems, weights});
  }, [gridItems, gridLayout, layers, plots, regressions, textItems, weights]);

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

  const enableGridItem = (id: string, layoutItem: Layout) => {
    // set the gridItem flag 'show' to true in gridItems
    const newItems = items?.map(item => (item.id === id ? {...item, show: true} : item));
    // add the new layoutItem to layout
    const newLayout = [
      ...layout,
      {
        ...layoutItem,
        i: id,
        w: 6,
        h: 6,
        static: false
      }
    ];
    // update redux state
    dispatch(updateLayout({layout: newLayout}));
    dispatch(updateGridItems(newItems));
  };

  const onDrop = (layout: Layout[], layoutItem: Layout, _event: Event) => {
    // only update layout if showGridView is true
    if (showGridView) {
      let droppedItem = null;
      try {
        // @ts-ignore event does not have dataTransfer by react-grid-layout
        droppedItem = JSON.parse(_event.dataTransfer.getData('text/plain'));
      } catch (e) {
        console.error('Error parsing dropped item', e);
      }
      if (droppedItem?.type === 'text') {
        // add chat message as a new text item
        const {id, message} = droppedItem;
        // add message in textItems if id doesn not exist
        if (!textItems?.find(textItem => textItem.id === id)) {
          const {x, y} = layoutItem;
          // @ts-ignore getEditorState returns a string here
          dispatch(addTextGridItem({id, x, y, content: getEditorState(message)}));
        } else {
          // set the gridItem flag 'show' to true in gridItems
          enableGridItem(id, layoutItem);
        }
      } else if (droppedItem?.id) {
        const itemId = droppedItem.id;
        enableGridItem(itemId, layoutItem);
      }
    }
  };

  // create a dictionary {id: type} from gridItems and useMemo to avoid re-render
  const gridItemsDict = useMemo(() => {
    return items?.reduce((acc: {[key: string]: GRID_ITEM_TYPES}, item) => {
      acc[item.id] = item.type;
      return acc;
    }, {});
  }, [items]);

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
      droppingItem={{w: 6, h: 6, i: 'dropping-item'}}
    >
      {layout.map((l: Layout) => {
        const gridItemType = gridItemsDict?.[l.i];
        if (gridItemType === GRID_ITEM_TYPES.TEXT) {
          const textItem = textItems?.find(t => t.id === l.i);
          return textItem ? (
            <div key={l.i} style={cellStyle} className={l.i}>
              <GridCell id={l.i} mode={mode}>
                <TextCell id={l.i} mode={mode} theme={theme} initialState={textItem.content} />
              </GridCell>
            </div>
          ) : null;
        } else if (gridItemType === GRID_ITEM_TYPES.LAYER) {
          return (
            <div key={l.i} style={cellStyle} className={l.i}>
              <GridCell id={l.i} mode={mode}>
                <KeplerMapContainer layerId={l.i} mapIndex={1} />
              </GridCell>
            </div>
          );
        } else if (gridItemType === GRID_ITEM_TYPES.PLOT) {
          const plot = plots.find(p => p.id === l.i);
          return plot ? (
            <div key={l.i} style={cellStyle} className={l.i}>
              <GridCell id={l.i} mode={mode}>
                {PlotWrapper(plot, false)}
              </GridCell>
            </div>
          ) : null;
        } else if (gridItemType === GRID_ITEM_TYPES.REGRESSION) {
          const regression = regressions.find(r => r.id === l.i);
          return regression ? (
            <div key={l.i} style={cellStyle} className={l.i}>
              <GridCell id={l.i} mode={mode}>
                <RegressionReport key={l.i} regression={regression} />
              </GridCell>
            </div>
          ) : null;
        } else if (gridItemType === GRID_ITEM_TYPES.WEIGHTS) {
          const weight = weights.find(w => w.weightsMeta.id === l.i);
          return weight ? (
            <div key={l.i} style={cellStyle} className={l.i}>
              <GridCell id={l.i} mode={mode}>
                <WeightsMetaTable weightsMeta={weight.weightsMeta} />
              </GridCell>
            </div>
          ) : null;
        } else if (l.i === 'table') {
          return (
            <div key={l.i} style={cellStyle}>
              <GridCell id={l.i} mode={mode}>
                <DuckDBTable />
              </GridCell>
            </div>
          );
        }
      })}
    </ReactGridLayout>
  );
};

export default GridLayout;
