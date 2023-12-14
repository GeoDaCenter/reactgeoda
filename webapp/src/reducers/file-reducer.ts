import {ProcessorResult} from '@kepler.gl/types';
import {FILE_ACTIONS, ProcessBatchesAction} from '../actions';
import {wrapTo, addDataToMap, processFileContent} from '@kepler.gl/actions';
import {FileCacheItem, ProcessFileDataContent, processFileData} from '@kepler.gl/processors';

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

// create a reduce function to handle PROCESS_BATHES action
async function processBatchesUpdater(state: any, action: ProcessBatchesAction) {
  const {batches} = action.payload;
  // iterate through the AsyncGenerator batches
  let result = await batches.next();
  let content: ProcessFileDataContent;
  while (!result.done) {
    console.log('processBatchesUpdater', result.value, result.done);
    content = result.value as ProcessFileDataContent;
    result = await batches.next();
    if (result.done) {
      const parsedData = await processFileData({
        content,
        fileCache: []
      });
      console.log('parsedData', parsedData);
      break;
    }
  }

  // batches.next().then((result: any) => {
  //   const {value, done} = result;
  //   console.log('processBatchesUpdater', result);
  //   if (!done) {
  //     processBatchesUpdater(state, batches);
  //   }
  // });
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
    case FILE_ACTIONS.PROCESS_BATCHES:
      return processBatchesUpdater(state, action);
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
