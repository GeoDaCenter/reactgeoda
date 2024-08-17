import {RuleGroupType} from 'react-querybuilder';
import {UI_ACTIONS} from '../actions';

const LOCAL_API_KEY = process.env.NEXT_PUBLIC_API_KEY || '';

export type UiAction = {
  type: UI_ACTIONS;
  payload: string | boolean;
};

export type UiStateProps = {
  theme: string;
  defaultDatasetId: string;
  showPropertyPanel: boolean;
  showChatPanel: boolean;
  propertyPanelName: string;
  openFileModal: {
    showOpenFileModal: boolean;
    openFileModalError?: string;
    showAddDatasetModal: boolean;
    addDatasetModalError?: string;
    isLoading?: boolean;
  };
  showSaveProjectModal: boolean;
  showKeplerTable: boolean;
  showGridView: boolean;
  openAIKey: string;
  isOpenAIKeyChecked: boolean;
  screenCaptured: string;
  startScreenCapture: boolean;
  defaultPromptText: string;
  table: {
    queryBuilder?: RuleGroupType;
    queryCode?: string;
    showQueryBuilder: boolean;
  };
};

export const INITIAL_UI_STATE = {
  theme: 'dark',
  defaultDatasetId: '',
  openFileModal: {
    showOpenFileModal: true,
    showAddDatasetModal: false
  },
  showSaveProjectModal: false,
  showKeplerTable: false,
  showGridView: false,
  showPropertyPanel: false,
  showChatPanel: false,
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

export const uiReducer = (state = INITIAL_UI_STATE, action: UiAction): UiStateProps => {
  switch (action.type) {
    case UI_ACTIONS.SET_THEME:
      return {
        ...state,
        theme: action.payload as string
      };
    case UI_ACTIONS.SET_DEFAULT_DATASET_ID:
      return {
        ...state,
        defaultDatasetId: action.payload as string
      };
    case UI_ACTIONS.SET_SCREEN_CAPTURED:
      return {
        ...state,
        screenCaptured: action.payload as string
      };
    case UI_ACTIONS.SET_START_SCREEN_CAPTURE:
      return {
        ...state,
        startScreenCapture: action.payload as boolean
      };
    case UI_ACTIONS.SET_DEFAULT_PROMPT_TEXT:
      return {
        ...state,
        defaultPromptText: action.payload as string
      };
    case UI_ACTIONS.SET_OPEN_FILE_MODAL:
      return {
        ...state,
        openFileModal: {
          ...state.openFileModal,
          showOpenFileModal: action.payload as boolean
        }
      };
    case UI_ACTIONS.SET_OPEN_FILE_MODAL_IS_LOADING:
      return {
        ...state,
        openFileModal: {
          ...state.openFileModal,
          isLoading: action.payload as boolean
        }
      };
    case UI_ACTIONS.SET_OPEN_FILE_MODAL_ERROR:
      return {
        ...state,
        openFileModal: {
          ...state.openFileModal,
          openFileModalError: action.payload as string
        }
      };
    case UI_ACTIONS.SET_ADD_DATASET_MODAL:
      return {
        ...state,
        openFileModal: {
          ...state.openFileModal,
          showAddDatasetModal: action.payload as boolean
        }
      };
    case UI_ACTIONS.SET_SAVE_PROJECT_MODAL:
      return {
        ...state,
        showSaveProjectModal: action.payload as boolean
      };
    case UI_ACTIONS.SET_KEPLER_TABLE_MODAL:
      return {
        ...state,
        showKeplerTable: action.payload as boolean
      };
    case UI_ACTIONS.SET_GRID_VIEW:
      return {
        ...state,
        showGridView: action.payload as boolean
      };
    case UI_ACTIONS.SET_SHOW_PROPERTY_PANEL:
      return {
        ...state,
        showPropertyPanel: action.payload as boolean
      };
    case UI_ACTIONS.SET_PROPERTY_PANEL:
      return {
        ...state,
        // always show property panel when changing property panel
        showPropertyPanel: true,
        propertyPanelName: action.payload as string
      };
    case UI_ACTIONS.SET_SHOW_CHAT_PANEL:
      return {
        ...state,
        showChatPanel: action.payload as boolean
      };
    case UI_ACTIONS.SET_OPENAI_KEY:
      return {
        ...state,
        openAIKey: (action.payload || '') as string
      };
    case UI_ACTIONS.SET_IS_OPENAI_KEY_CHECKED:
      return {
        ...state,
        isOpenAIKeyChecked: action.payload as boolean
      };
    case UI_ACTIONS.SET_SHOW_QUERY_BUILDER:
      return {
        ...state,
        table: {
          ...state.table,
          showQueryBuilder: action.payload as boolean
        }
      };
    case UI_ACTIONS.SET_QUERY_CODE:
      return {
        ...state,
        table: {
          ...state.table,
          queryCode: action.payload as string
        }
      };
    default:
      return state;
  }
};
