import {ProcessorResult} from '@kepler.gl/types';
import {FILE_ACTIONS} from '../actions';
import {FileCacheItem} from '@kepler.gl/processors';

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

function processFilesUpdater(state: any, action: {payload: {files: Promise<FileCacheItem[]>}}) {
  console.log('processFilesUpdater', action.payload);
  action.payload.files.then((files: FileCacheItem[]) => {
    console.log('processFilesUpdater', files);
  });
}

const fileReducer = (state = initialState, action: any) => {
  switch (action.type) {
    case FILE_ACTIONS.SET_DEFAULT_DATA:
      return {
        ...state,
        fileData: action.payload.processedData,
        rawFileData: action.payload.rawData
      };
    case FILE_ACTIONS.SET_FILE_DATA:
      return setFileDataUpdater(state, action);
    case FILE_ACTIONS.PROCESS_FILES:
      return processFilesUpdater(state, action);
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
