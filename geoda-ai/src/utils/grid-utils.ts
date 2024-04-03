import {PlotProps} from '@/actions';
import {RegressionProps} from '@/actions/regression-actions';
import {Layer} from '@kepler.gl/layers';
import {EditorState} from 'lexical/LexicalEditorState';
import {Layout} from 'react-grid-layout';

export type GridItemProps = {
  id: string;
  show: boolean;
};

export type GridTextItemProps = {
  id: string;
  content: EditorState;
};

export type CreateGridItemsProps = {
  gridLayout?: Layout[];
  gridItems: GridItemProps[];
  layers: Layer[];
  plots: PlotProps[];
  regressions: RegressionProps[];
  textItems?: GridTextItemProps[];
};

/**
 * Update the grid items if any new layers, plots, regressions, or text items are added
 */
export function createGridItems({
  gridItems,
  layers,
  plots,
  regressions,
  textItems
}: CreateGridItemsProps): GridItemProps[] {
  const newGridItems = [...(gridItems || [])];

  textItems?.forEach(textItem => {
    if (!newGridItems.find(l => l.id === textItem.id)) {
      newGridItems.push({
        id: textItem.id,
        show: true
      });
    }
  });

  layers?.forEach((layer: Layer) => {
    if (!newGridItems.find(l => l.id === layer.id)) {
      newGridItems.push({
        id: layer.id,
        show: true
      });
    }
  });

  plots?.forEach((plot: PlotProps) => {
    if (!newGridItems.find(l => l.id === plot.id)) {
      newGridItems.push({
        id: plot.id,
        show: true
      });
    }
  });

  regressions?.forEach((regression: RegressionProps) => {
    if (!newGridItems.find(l => l.id === regression.id)) {
      newGridItems.push({
        id: regression.id,
        show: true
      });
    }
  });

  return newGridItems;
}

export type InitGridItemsProps = Pick<
  CreateGridItemsProps,
  'layers' | 'plots' | 'regressions' | 'textItems'
>;
export function initGridItems({
  layers,
  plots,
  regressions,
  textItems
}: InitGridItemsProps): GridItemProps[] {
  const newGridItems: GridItemProps[] = [];

  textItems?.map(textItem => {
    newGridItems.push({
      id: textItem.id,
      show: true
    });
  });

  layers?.map((layer: Layer) => {
    newGridItems.push({
      id: layer.id,
      show: true
    });
  });

  plots?.map((plot: PlotProps) => {
    newGridItems.push({
      id: plot.id,
      show: true
    });
  });

  regressions?.map((regression: RegressionProps) => {
    newGridItems.push({
      id: regression.id,
      show: true
    });
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
  gridItems.forEach(item => {
    const layout = originalLayout?.find(l => l.i === item.id);
    if (item.show) {
      if (layout) {
        newLayout.push(layout);
      } else {
        newLayout.push({
          w: 6,
          h: 6,
          x: 0,
          y: Infinity, // puts it at the bottom,
          i: item.id,
          static: false
        });
      }
    }
  });
  return newLayout;
}
