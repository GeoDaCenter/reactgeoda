import {UI_ACTIONS} from '../actions';

export type UiAction = {
  type: UI_ACTIONS;
  payload: any;
};

const initialState = {
  theme: 'light',
  showOpenFileModal: false,
  showKeplerTableModal: false,
  showGridView: false
};

const uiReducer = (state = initialState, action: UiAction) => {
  switch (action.type) {
    case UI_ACTIONS.SET_OPEN_FILE_MODAL:
      return {
        ...state,
        showOpenFileModal: action.payload
      };
    case UI_ACTIONS.SET_KEPLER_TABLE_MODAL:
      return {
        ...state,
        showKeplerTableModal: action.payload
      };
    case UI_ACTIONS.SET_GRID_VIEW:
      return {
        ...state,
        showGridView: action.payload
      };
    default:
      return state;
  }
};

export default uiReducer;
