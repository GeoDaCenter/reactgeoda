import {RowData, ProcessorResult} from '@kepler.gl/types';
import { Feature, FeatureCollection, Geometry } from 'geojson';

export enum FILE_ACTIONS {
  SET_FILE_DATA = 'SET_FILE_DATA',
  SET_RAW_FILE_DATA = 'SET_RAW_FILE_DATA',
  SET_DEFAULT_DATA = 'SET_DEFAULT_DATA'
}



export type RawData = RowData | FeatureCollection<Geometry>;



interface DefaultDataPayload {
  processedData: ProcessorResult | null;
  rawData: RawData | null;
}

export type DefaultDataAction = {
  type: string;
  payload: DefaultDataPayload;
};


export const setFileData = (data: ProcessorResult) => ({
  type: FILE_ACTIONS.SET_FILE_DATA,
  payload: data
});

export const setRawFileData = (data: RawData) => {
  console.log("setRawFileData payload:", data);
  return {
    type: FILE_ACTIONS.SET_RAW_FILE_DATA,
    payload: data,
  };
};


export const setDefaultData = (payload: DefaultDataPayload) => {
  console.log("setDefaultData payload:", payload);
  return {
    type: FILE_ACTIONS.SET_DEFAULT_DATA,
    payload,
  };
};