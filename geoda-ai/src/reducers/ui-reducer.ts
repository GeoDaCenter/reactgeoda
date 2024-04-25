import {UI_ACTIONS} from '../actions';

const LOCAL_API_KEY = process.env.NEXT_PUBLIC_API_KEY || '';

export type UiAction = {
  type: UI_ACTIONS;
  payload: string | boolean;
};

const initialState = {
  theme: 'light',
  showOpenFileModal: false,
  showSaveProjectModal: false,
  showKeplerTableModal: false,
  showGridView: false,
  showPropertyPanel: false,
  propertyPanelName: '',
  openAIKey: LOCAL_API_KEY,
  table: {
    showQueryBuilder: true
  }
};

export const uiReducer = (state = initialState, action: UiAction) => {
  switch (action.type) {
    case UI_ACTIONS.SET_THEME:
      return {
        ...state,
        theme: action.payload
      };
    case UI_ACTIONS.SET_OPEN_FILE_MODAL:
      return {
        ...state,
        showOpenFileModal: action.payload
      };
    case UI_ACTIONS.SET_SAVE_PROJECT_MODAL:
      return {
        ...state,
        showSaveProjectModal: action.payload
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
    case UI_ACTIONS.SET_SHOW_QUERY_BUILDER:
      return {
        ...state,
        table: {
          ...state.table,
          showQueryBuilder: action.payload
        }
      };
    case UI_ACTIONS.SET_QUERY_CODE:
      return {
        ...state,
        table: {
          ...state.table,
          queryCode: action.payload
        }
      };
    default:
      return state;
  }
};
