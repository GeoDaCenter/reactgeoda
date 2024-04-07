import {FileCacheItem} from '@kepler.gl/processors';
import {ProcessorResult} from '@kepler.gl/types';
import {Table as ArrowTable} from 'apache-arrow';

export enum FILE_ACTIONS {
  SET_FILE_DATA = 'SET_FILE_DATA',
  SET_RAW_FILE_DATA = 'SET_RAW_FILE_DATA',
  SAVE_PROJECT = 'SAVE_PROJECT'
}

export const setFileData = (data: ProcessorResult) => ({
  type: FILE_ACTIONS.SET_FILE_DATA,
  payload: data
});

export const saveProject = () => ({
  type: FILE_ACTIONS.SAVE_PROJECT
});

export type RawFileDataProps = {
  // the file name
  fileName: string;
  // the raw arrow table for duckdb
  arrowTable: ArrowTable;
  // the processed data for kepler.gl
  arrowFormatData?: FileCacheItem;
};

export const setRawFileData = (data: RawFileDataProps) => ({
  // arrow data
  type: FILE_ACTIONS.SET_RAW_FILE_DATA,
  payload: data
});
