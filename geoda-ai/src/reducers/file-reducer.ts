import {FileCacheItem} from '@kepler.gl/processors';
import {Table as ArrowTable} from 'apache-arrow';

import {FILE_ACTIONS} from '../actions';

export type DatasetsAction = {
  type: string;
  payload: DatasetProps;
};

export type DatasetProps = {
  // the file name
  fileName: string;
  // the dataId, should be the same as the dataId in kepler.gl
  dataId?: string;
  // the raw arrow table for duckdb
  arrowTable: ArrowTable;
  // the processed data for kepler.gl
  arrowFormatData?: FileCacheItem;
};

const INITIAL_DATASETS_STATE: DatasetProps[] = [];

// updater function to set dataset
export function addDatasetUpdater(state: DatasetProps[], action: {payload: DatasetProps}) {
  // state should be empty, when setting a new dataset, it should be the only dataset
  return [...state, action.payload];
}

const fileReducer = (state = INITIAL_DATASETS_STATE, action: DatasetsAction) => {
  switch (action.type) {
    case FILE_ACTIONS.ADD_DATASET:
      return addDatasetUpdater(state, action);
    default:
      return state;
  }
};

export default fileReducer;
