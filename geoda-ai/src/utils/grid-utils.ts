import {PlotActionProps, WeightsProps} from '@/actions';
import {RegressionProps} from '@/actions/regression-actions';
import {Layer} from '@kepler.gl/layers';
import {EditorState} from 'lexical';
import {Layout} from 'react-grid-layout';

// create enum GRID_ITEM_TYPES
export enum GRID_ITEM_TYPES {
  LAYER = 'layer',
  PLOT = 'plot',
  REGRESSION = 'regression',
  TEXT = 'text',
  TABLE = 'table',
  WEIGHTS = 'weights'
}

export type GridItemProps = {
  id: string;
  show: boolean;
  type: GRID_ITEM_TYPES;
};

export type GridTextItemProps = {
  id: string;
  content: EditorState;
};

export type InitGridItemsProps = Pick<
  CreateGridItemsProps,
  'layers' | 'plots' | 'regressions' | 'textItems' | 'weights'
>;
export function initGridItems({
  layers,
  plots,
  regressions,
  textItems,
  weights
}: InitGridItemsProps): GridItemProps[] {
  const newGridItems: GridItemProps[] = [];

  textItems?.forEach(textItem => {
    newGridItems.push({
      id: textItem.id,
      show: true,
      type: GRID_ITEM_TYPES.TEXT
    });
  });

  layers?.forEach((layer: Layer) => {
    newGridItems.push({
      id: layer.id,
      show: true,
      type: GRID_ITEM_TYPES.LAYER
    });
  });

  plots?.forEach((plot: PlotActionProps) => {
    newGridItems.push({
      id: plot.id,
      show: true,
      type: GRID_ITEM_TYPES.PLOT
    });
  });

  regressions?.forEach((regression: RegressionProps) => {
    newGridItems.push({
      id: regression.id,
      show: true,
      type: GRID_ITEM_TYPES.REGRESSION
    });
  });

  weights?.forEach((weight: WeightsProps) => {
    if (weight.weightsMeta.id) {
      newGridItems.push({
        id: weight.weightsMeta.id,
        show: true,
        type: GRID_ITEM_TYPES.WEIGHTS
      });
    }
  });

  // add table
  newGridItems.push({
    id: 'table',
    show: false,
    type: GRID_ITEM_TYPES.TABLE
  });

  return newGridItems;
}

export type CreateGridItemsProps = {
  gridLayout?: Layout[];
  gridItems: GridItemProps[];
  layers: Layer[];
  plots: PlotActionProps[];
  regressions: RegressionProps[];
  textItems?: GridTextItemProps[];
  weights?: WeightsProps[];
};

/**
 * Update the grid items if any new layers, plots, regressions, or text items are added
 */
export function createGridItems({
  gridItems,
  layers,
  plots,
  regressions,
  textItems,
  weights
}: CreateGridItemsProps): GridItemProps[] {
  const newGridItems = [...(gridItems || [])];

  textItems?.forEach(textItem => {
    if (!newGridItems.find(l => l.id === textItem.id)) {
      newGridItems.push({
        id: textItem.id,
        show: true,
        type: GRID_ITEM_TYPES.TEXT
      });
    }
  });

  layers?.forEach((layer: Layer) => {
    if (!newGridItems.find(l => l.id === layer.id)) {
      newGridItems.push({
        id: layer.id,
        show: true,
        type: GRID_ITEM_TYPES.LAYER
      });
    }
  });

  plots?.forEach((plot: PlotActionProps) => {
    if (!newGridItems.find(l => l.id === plot.id)) {
      newGridItems.push({
        id: plot.id,
        show: true,
        type: GRID_ITEM_TYPES.PLOT
      });
    }
  });

  regressions?.forEach((regression: RegressionProps) => {
    if (!newGridItems.find(l => l.id === regression.id)) {
      newGridItems.push({
        id: regression.id,
        show: true,
        type: GRID_ITEM_TYPES.REGRESSION
      });
    }
  });

  weights?.forEach((weight: WeightsProps) => {
    if (!newGridItems.find(l => l.id === weight.weightsMeta.id) && weight.weightsMeta.id) {
      newGridItems.push({
        id: weight.weightsMeta.id,
        show: true,
        type: GRID_ITEM_TYPES.WEIGHTS
      });
    }
  });

  return newGridItems;
}

export function initGridLayout(gridItems: GridItemProps[]): Layout[] {
  // for each gridItem, create a react grid layout with w: 6 and h: 6 in two columns
  return gridItems
    .filter(item => item.show)
    .map((item, index) => ({
      w: 6,
      h: 6,
      x: index % 2 === 0 ? 0 : 6,
      y: 6 * Math.floor(index / 2),
      i: item.id,
      static: false
    }));
}

export function createGridLayout(gridItems: GridItemProps[], originalLayout?: Layout[]): Layout[] {
  // update the original layout with the new gridItems by adding new layout and removing layout that are not in gridItems or hidden
  const newLayout: Layout[] = [];

  // create a dict {id: type} for gridItems
  const gridItemsDict: Record<string, boolean> = {};
  gridItems.forEach(item => {
    gridItemsDict[item.id] = item.show;
  });
  originalLayout?.forEach((l: Layout) => {
    const isShow = gridItemsDict[l.i];
    if (isShow) {
      newLayout.push(l);
    }
  });

  // add new gridItems in newLayout if needed
  gridItems.forEach(item => {
    const layout = originalLayout?.find(l => l.i === item.id);
    if (!layout && item.show) {
      newLayout.push({
        w: 6,
        h: 6,
        x: 0,
        y: Infinity, // puts it at the bottom,
        i: item.id,
        static: false
      });
    }
  });
  return newLayout;
}
