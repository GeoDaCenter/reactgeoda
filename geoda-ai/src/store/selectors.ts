import {Selector, createSelector} from 'reselect';
import {GeoDaState} from '.';
import {MAP_ID} from '@/constants';
import {getDataContainer} from '@/utils/data-utils';
import {Layer} from '@kepler.gl/layers';
import {Datasets as KeplerDatasets} from '@kepler.gl/table';

type StateSelector<R> = Selector<GeoDaState, R>;

export const defaultDatasetIdSelector: StateSelector<string> = (state: GeoDaState) =>
  state.root.uiState.defaultDatasetId;

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

// create a memorized selector to get kepler visState
export const keplerVisStateSelector = (state: GeoDaState) => state.keplerGl[MAP_ID].visState;

export const keplerUIStateSelector = (state: GeoDaState) => state.keplerGl[MAP_ID].uiState;

export const keplerLocaleSelector = (state: GeoDaState) =>
  state.keplerGl[MAP_ID]?.uiState?.locale || 'en';

export const keplerDatasetsSelector = (state: GeoDaState) =>
  state.keplerGl[MAP_ID].visState.datasets;

export const selectDefaultKeplerDataset = createSelector(
  [(state: GeoDaState) => state.keplerGl[MAP_ID].visState.datasets],
  (datasets: KeplerDatasets) => {
    return Object.values(datasets).length > 0 ? Object.values(datasets)[0] : null;
  }
);

export const selectDefaultWeightsId = (state: GeoDaState) => state.root.uiState.defaultWeightsId;

export const selectKeplerDataset = (dataId?: string) =>
  createSelector(
    [(state: GeoDaState) => state.keplerGl[MAP_ID].visState.datasets],
    (datasets: KeplerDatasets) => {
      return dataId && dataId in datasets ? datasets[dataId] : Object.values(datasets)[0];
    }
  );

export const selectWeightsByDataId = (datasetId: string) =>
  createSelector([(state: GeoDaState) => state.root.weights], weights => {
    return weights.filter(weight => weight.datasetId === datasetId);
  });

export const selectSpatialAssignConfig = (state: GeoDaState) =>
  state.root.spatialJoin.spatialAssign;

export const selectSpatialCountConfig = (state: GeoDaState) => state.root.spatialJoin.spatialCount;
