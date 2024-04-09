import {ProcessorResult} from '@kepler.gl/types';
import {FILE_ACTIONS} from '../actions';

export type FileStateProps = {
  fileData: Array<ProcessorResult>;
  rawFileData: any;
};

export type FileAction = {
  type: FILE_ACTIONS;
  payload: {
    processedData: ProcessorResult;
    rawData: any;
  };
};

type SetFileDataActionPayload = {
  payload: ProcessorResult[];
};
// create a reduce function to handle SET_FILE_DATA action
function setFileDataUpdater(
  state: FileStateProps,
  action: SetFileDataActionPayload
): FileStateProps {
  const fileData = action.payload;

  return {
    ...state,
    fileData
  };
}

function saveProjectUpdater(state: FileStateProps): FileStateProps {
  return state;
}

const initialState: FileStateProps = {
  fileData: [],
  rawFileData: null
};

const fileReducer = (state = initialState, action: any) => {
  switch (action.type) {
    case FILE_ACTIONS.SET_FILE_DATA:
      return setFileDataUpdater(state, action);
    case FILE_ACTIONS.SET_RAW_FILE_DATA:
      return {
        ...state,
        rawFileData: action.payload
      };
    case FILE_ACTIONS.SAVE_PROJECT:
      return saveProjectUpdater(state);
    default:
      return state;
  }
};

export default fileReducer;
