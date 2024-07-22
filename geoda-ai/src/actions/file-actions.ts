import {FileCacheItem} from '@kepler.gl/processors';
import {Table as ArrowTable} from 'apache-arrow';

export enum FILE_ACTIONS {
  ADD_DATASET = 'ADD_DATASET',
  SAVE_PROJECT = 'SAVE_PROJECT'
}

export const saveProject = () => ({
  type: FILE_ACTIONS.SAVE_PROJECT
});

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

export const addDataset = (data: DatasetProps) => ({
  // arrow data
  type: FILE_ACTIONS.ADD_DATASET,
  payload: data
});
