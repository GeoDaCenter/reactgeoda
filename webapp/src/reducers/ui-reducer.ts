import {UI_ACTIONS} from '../actions';

export type UiAction = {
  type: UI_ACTIONS;
  payload: any;
};

const initialState = {
  showOpenFileModal: false
};

const uiReducer = (state = initialState, action: UiAction) => {
  switch (action.type) {
    case UI_ACTIONS.SET_OPEN_FILE_MODAL:
      return {
        ...state,
        showOpenFileModal: action.payload
      };
    default:
      return state;
  }
};

export default uiReducer;
