import {UI_ACTIONS} from '../actions';

const LOCAL_API_KEY = process.env.NEXT_PUBLIC_API_KEY || '';

export type UiAction = {
  type: UI_ACTIONS;
  payload: string | boolean;
};

export const INITIAL_UI_STATE = {
  theme: 'dark',
  showOpenFileModal: false,
  showAddDatasetModal: false,
  showSaveProjectModal: false,
  showKeplerTableModal: false,
  showGridView: false,
  showPropertyPanel: false,
  propertyPanelName: '',
  openAIKey: LOCAL_API_KEY,
  isOpenAIKeyChecked: false,
  screenCaptured: '',
  startScreenCapture: false,
  defaultPromptText: '',
  table: {
    showQueryBuilder: true
  }
};

export const uiReducer = (state = INITIAL_UI_STATE, action: UiAction) => {
  switch (action.type) {
    case UI_ACTIONS.SET_THEME:
      return {
        ...state,
        theme: action.payload
      };
    case UI_ACTIONS.SET_SCREEN_CAPTURED:
      return {
        ...state,
        screenCaptured: action.payload
      };
    case UI_ACTIONS.SET_START_SCREEN_CAPTURE:
      return {
        ...state,
        startScreenCapture: action.payload
      };
    case UI_ACTIONS.SET_DEFAULT_PROMPT_TEXT:
      return {
        ...state,
        defaultPromptText: action.payload
      };
    case UI_ACTIONS.SET_OPEN_FILE_MODAL:
      return {
        ...state,
        showOpenFileModal: action.payload
      };
    case UI_ACTIONS.SET_ADD_DATASET_MODAL:
      return {
        ...state,
        showAddDatasetModal: action.payload
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
        openAIKey: action.payload || ''
      };
    case UI_ACTIONS.SET_IS_OPENAI_KEY_CHECKED:
      return {
        ...state,
        isOpenAIKeyChecked: action.payload
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
