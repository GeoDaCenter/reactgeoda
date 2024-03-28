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

// create a reduce function to handle SET_FILE_DATA action
function setFileDataUpdater(state: any, action: any) {
  const fileData = action.payload;

  return {
    ...state,
    fileData
  };
}

const fileReducer = (state = initialState, action: any) => {
  switch (action.type) {
    case FILE_ACTIONS.SET_FILE_DATA:
      return setFileDataUpdater(state, action);
    case FILE_ACTIONS.SET_RAW_FILE_DATA:
      return {
        ...state,
        rawFileData: action.payload
      };
    default:
      return state;
  }
};

export default fileReducer;
