import {Selector, createSelector} from 'reselect';
import {GeoDaState} from '.';
import {MAP_ID} from '@/constants';
import {getDataContainer, getIntegerAndStringFieldNamesFromDataset} from '@/utils/data-utils';
import {getColumnDataFromArrowTable} from '@/utils/arrow-table-utils';
import {Layer} from '@kepler.gl/layers';
import KeplerTable, {Datasets as KeplerDatasets} from '@kepler.gl/table';
import {
  getBinaryGeometriesFromLayer,
  getBinaryGeometryTypeFromLayer
} from '@/components/spatial-operations/spatial-join-utils';

type StateSelector<R> = Selector<GeoDaState, R>;

/**
 * Selector that retrieves the default dataset ID from the application state.
 * @param {GeoDaState} state - The global application state
 * @returns {string} The default dataset ID
 */
export const defaultDatasetIdSelector: StateSelector<string> = (state: GeoDaState) =>
  state.root.uiState.defaultDatasetId;

/**
 * Selector that retrieves all datasets from the application state.
 * @param {GeoDaState} state - The global application state
 * @returns {GeoDaState['root']['datasets']} Array of all datasets
 */
export const datasetsSelector: StateSelector<GeoDaState['root']['datasets']> = (
  state: GeoDaState
) => state.root.datasets;

/**
 * Selector that retrieves the filename of the main table (first dataset).
 * @param {GeoDaState} state - The global application state
 * @returns {string} The filename of the main table, or empty string if no datasets exist
 */
export const mainTableNameSelector: StateSelector<string> = (state: GeoDaState) =>
  state.root.datasets?.length > 0 ? state.root.datasets[0].fileName : '';

export const mainDataIdSelector: StateSelector<string> = (state: GeoDaState) =>
  state.root.datasets?.length > 0 ? state.root.datasets[0].dataId || '' : '';

export const geodaUIStateSelector: StateSelector<GeoDaState['root']['uiState']> = (
  state: GeoDaState
) => state.root.uiState;

/**
 * Memoized selector that retrieves the Kepler data container for the main table.
 * @param {GeoDaState} state - The global application state
 * @returns {Object} The data container for the specified table name
 */
export const keplerDataContainerSelector = createSelector(
  [
    (state: GeoDaState) => state.root.datasets[0].fileName,
    (state: GeoDaState) => state.keplerGl[MAP_ID].visState.datasets
  ],
  (tableName, datasets) => getDataContainer(tableName, datasets)
);

/**
 * Creates a memoized selector to retrieve a Kepler layer by its data ID.
 * @param {string} [dataId] - Optional data ID to filter the layer
 * @returns {Function} Selector function that returns the matching Kepler layer
 */
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

/**
 * Creates a memoized selector to retrieve geometry data from a layer and dataset.
 * @param {Object} props - Props containing state, layer, and dataset
 * @param {GeoDaState} props.state - The global application state
 * @param {Layer} props.layer - The Kepler layer
 * @param {KeplerTable} props.dataset - The Kepler dataset
 * @returns {Object} Object containing binary geometry type and geometries
 */
export const selectGeometryData = createSelector(
  [
    (props: {state: GeoDaState; layer: Layer; dataset: KeplerTable}) => props.layer,
    (props: {state: GeoDaState; layer: Layer; dataset: KeplerTable}) => props.dataset
  ],
  (layer, dataset) => ({
    binaryGeometryType: getBinaryGeometryTypeFromLayer(layer),
    binaryGeometries: getBinaryGeometriesFromLayer(layer, dataset)
  })
);

/**
 * Creates a memoized selector to retrieve variables from a dataset.
 * @param {string} datasetId - The ID of the dataset to get variables from
 * @returns {Function} Selector function that returns array of integer and string field names
 */
export const selectVariables = (datasetId: string) =>
  createSelector([(state: GeoDaState) => state.keplerGl[MAP_ID].visState.datasets], datasets => {
    const dataset = datasets[datasetId];
    return dataset ? getIntegerAndStringFieldNamesFromDataset(dataset) : [];
  });

/**
 * Creates a memoized selector to retrieve raw data for specified variables from a dataset.
 * @param {string} datasetId - The ID of the dataset to get data from
 * @param {string[]} variableNames - Array of variable names to retrieve
 * @returns {Function} Selector function that returns object mapping variable names to their data arrays
 */
export const selectRawData = (datasetId: string, variableNames: string[]) =>
  createSelector([(state: GeoDaState) => state.root.datasets], datasets => {
    const dataset = datasets.find(dataset => dataset.dataId === datasetId);
    // get the raw data from the arrow table
    const rawData: {
      [key: string]: number[];
    } = {};
    if (dataset) {
      const arrowTable = dataset.arrowTable;
      variableNames.forEach(variableName => {
        const data = getColumnDataFromArrowTable({arrowTable, columnName: variableName});
        rawData[variableName] = data;
      });
    }

    return rawData;
  });

export const selectTheme = (state: GeoDaState) => state.root.uiState.theme;
