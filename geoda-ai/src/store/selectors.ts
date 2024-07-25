import {Selector, createSelector} from 'reselect';
import {GeoDaState} from '.';
import {MAP_ID} from '@/constants';
import {getDataContainer} from '@/utils/data-utils';
import {Layer} from '@kepler.gl/layers';
import {Datasets as KeplerDatasets} from '@kepler.gl/table';

type StateSelector<R> = Selector<GeoDaState, R>;

export const datasetsSelector: StateSelector<GeoDaState['root']['datasets']> = (
  state: GeoDaState
) => state.root.datasets;

export const mainTableNameSelector: StateSelector<string> = (state: GeoDaState) =>
  state.root.datasets?.length > 0 ? state.root.datasets[0].fileName : '';

export const mainDataIdSelector: StateSelector<string> = (state: GeoDaState) =>
  state.root.datasets?.length > 0 ? state.root.datasets[0].dataId || '' : '';

export const geodaUIStateSelector: StateSelector<GeoDaState['root']['uiState']> = (
  state: GeoDaState
) => state.root.uiState;

// create a memoized selector to get kepler data container
export const keplerDataContainerSelector = createSelector(
  [
    (state: GeoDaState) => state.root.datasets[0].fileName,
    (state: GeoDaState) => state.keplerGl[MAP_ID].visState.datasets
  ],
  (tableName, datasets) => getDataContainer(tableName, datasets)
);

// create a memorized selector to get kepler layer based on input parameter: dataId
export const selectKeplerLayer = (dataId?: string) =>
  createSelector([(state: GeoDaState) => state.keplerGl[MAP_ID].visState.layers], layers => {
    // assume only one layer for now
    const layer = layers.find((layer: Layer) => layer.config.dataId === dataId);
    // assume all layers are GeojsonLayer in Kepler.gl in GeoDa.Ai
    return layer;
  });

export const selectKeplerDataset = (dataId?: string) =>
  createSelector(
    [(state: GeoDaState) => state.keplerGl[MAP_ID].visState.datasets],
    (datasets: KeplerDatasets) => {
      return dataId ? datasets[dataId] : Object.values(datasets)[0];
    }
  );
