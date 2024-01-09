import {UI_ACTIONS} from '../actions';

const LOCAL_API_KEY = process.env.NEXT_PUBLIC_API_KEY || '';

export type UiAction = {
  type: UI_ACTIONS;
  payload: any;
};

const initialState = {
  showOpenFileModal: false,
  showKeplerTableModal: false,
  showGridView: false,
  showPropertyPanel: false,
  propertyPanelName: '',
  openAIKey: LOCAL_API_KEY
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
    case UI_ACTIONS.SET_SHOW_PROPERTY_PANEL:
      return {
        ...state,
        showPropertyPanel: action.payload
      };
    case UI_ACTIONS.SET_PROPERTY_PANEL:
      return {
        ...state,
        // always show property panel when changing property panel
        showPropertyPanel: true,
        propertyPanelName: action.payload
      };
    case UI_ACTIONS.SET_OPENAI_KEY:
      return {
        ...state,
        openAIKey: action.payload
      };
    default:
      return state;
  }
};

export default uiReducer;
