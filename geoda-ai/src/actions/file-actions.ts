import {FileCacheItem} from '@kepler.gl/processors';
import {ProcessorResult} from '@kepler.gl/types';

export enum FILE_ACTIONS {
  SET_FILE_DATA = 'SET_FILE_DATA',
  SET_RAW_FILE_DATA = 'SET_RAW_FILE_DATA',
  SET_DEFAULT_DATA = 'SET_DEFAULT_DATA',
  PROCESS_FILES = 'PROCESS_FILES',
  PROCESS_BATCHES = 'PROCESS_BATCHES'
}

export type FileContent = {
  fileName: string;
  header: string[];
  data: any;
};

export type ProcessBatchesAction = {
  type: FILE_ACTIONS.PROCESS_BATCHES;
  payload: {
    batches: AsyncGenerator<unknown, any, unknown>;
  };
};

export const setFileData = (data: ProcessorResult) => ({
  type: FILE_ACTIONS.SET_FILE_DATA,
  payload: data
});

export const setRawFileData = (data: any) => ({
  // for jsgeoda
  type: FILE_ACTIONS.SET_RAW_FILE_DATA,
  payload: data
});

export const setDefaultData = (payload: any) => ({
  type: FILE_ACTIONS.SET_DEFAULT_DATA,
  payload
});

export const processFiles = (payload: {files: Promise<FileCacheItem[]>}) => ({
  type: FILE_ACTIONS.PROCESS_FILES,
  payload
});

export const processBatches = (payload: ProcessBatchesAction['payload']) => ({
  type: FILE_ACTIONS.PROCESS_BATCHES,
  payload
});
