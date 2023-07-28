import {SET_FILE_DATA, SET_RAW_FILE_DATA} from '../actions';

const initialState = {
  fileData: [],
  rawFileData: null
};

const fileReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_FILE_DATA:
      return {
        ...state,
        fileData: action.payload
      };
    case SET_RAW_FILE_DATA: // Added for jsgeoda. needs unprocessed data
      return {
        ...state,
        rawFileData: action.payload
      };
    default:
      return state;
  }
};

export default fileReducer;
