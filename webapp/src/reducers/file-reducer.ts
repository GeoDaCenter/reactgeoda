import {ProcessorResult} from '@kepler.gl/types';
import {FILE_ACTIONS} from '../actions';

export type FileAction = {
  type: FILE_ACTIONS;
  payload: {
    processedData: ProcessorResult;
    rawData: any;
  };
};

const initialState = {
  fileData: [],
  rawFileData: null
};

const fileReducer = (state = initialState, action: FileAction) => {
  switch (action.type) {
    case FILE_ACTIONS.SET_DEFAULT_DATA:
      return {
        ...state,
        fileData: action.payload.processedData,
        rawFileData: action.payload.rawData
      };
    case FILE_ACTIONS.SET_FILE_DATA:
      return {
        ...state,
        fileData: action.payload
      };
    case FILE_ACTIONS.SET_RAW_FILE_DATA: // Added for jsgeoda. needs unprocessed data
      return {
        ...state,
        rawFileData: action.payload
      };
    default:
      return state;
  }
};

export default fileReducer;
