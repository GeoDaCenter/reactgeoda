import { SET_FILE_DATA } from '../actions';

const initialState = {
  fileData: [],
};

const fileReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_FILE_DATA:
      return {
        ...state,
        fileData: action.payload,
      };
    default:
      return state;
  }
};

export default fileReducer;
