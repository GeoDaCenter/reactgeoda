import {ProcessorResult} from '@kepler.gl/types';

export enum FILE_ACTIONS {
  SET_FILE_DATA = 'SET_FILE_DATA',
  SET_RAW_FILE_DATA = 'SET_RAW_FILE_DATA',
  SET_DEFAULT_DATA = 'SET_DEFAULT_DATA'
}

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
