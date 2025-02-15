import {RuleGroupType} from 'react-querybuilder';
import {UI_ACTIONS} from '../actions';

const LOCAL_API_KEY = process.env.NEXT_PUBLIC_API_KEY || '';

export type UiAction = {
  type: UI_ACTIONS;
  payload: string | boolean | DistanceThresholdsProps;
};

export type DistanceThresholdsProps = {
  minDistance: number;
  maxDistance: number;
  maxPairDistance: number;
};

export type UiStateProps = {
  theme: string;
  defaultDatasetId: string;
  defaultWeightsId?: string;
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
  isPrompting: boolean;
  userAction: string;
  userActionScreenshot: string;
  isGuidingUser: boolean;
  startScreenCapture: boolean;
  defaultPromptText: string;
  table: {
    queryBuilder?: RuleGroupType;
    queryCode?: string;
    showQueryBuilder: boolean;
  };
  weights: {
    showWeightsPanel: boolean;
    weightsCreation: {
      isRunning: boolean;
      error: string | null;
    };
    distanceThresholds: DistanceThresholdsProps;
    distanceUnit: 'mile' | 'kilometer';
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
  isPrompting: false,
  isOpenAIKeyChecked: false,
  screenCaptured: '',
  userAction: '',
  userActionScreenshot: '',
  isGuidingUser: false,
  startScreenCapture: false,
  defaultPromptText: '',
  table: {
    showQueryBuilder: true
  },
  weights: {
    showWeightsPanel: false,
    weightsCreation: {
      isRunning: false,
      error: null
    },
    distanceThresholds: {
      minDistance: 0,
      maxDistance: 0,
      maxPairDistance: 0
    },
    distanceUnit: 'mile' as 'mile' | 'kilometer'
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
    case UI_ACTIONS.SET_DEFAULT_WEIGHTS_ID:
      return {
        ...state,
        defaultWeightsId: action.payload as string
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
    case UI_ACTIONS.SET_USER_ACTION:
      return {
        ...state,
        userAction: action.payload as string
      };
    case UI_ACTIONS.SET_USER_ACTION_SCREENSHOT:
      return {
        ...state,
        userActionScreenshot: action.payload as string
      };
    case UI_ACTIONS.SET_GUIDING_USER:
      return {
        ...state,
        isGuidingUser: action.payload as boolean
      };
    case UI_ACTIONS.SET_IS_PROMPTING:
      return {
        ...state,
        isPrompting: action.payload as boolean
      };
    case UI_ACTIONS.SET_SHOW_WEIGHTS_PANEL:
      return {
        ...state,
        weights: {
          ...state.weights,
          showWeightsPanel: action.payload as boolean
        }
      };
    case UI_ACTIONS.SET_START_WEIGHTS_CREATION:
      return {
        ...state,
        weights: {
          ...state.weights,
          weightsCreation: {
            ...state.weights.weightsCreation,
            isRunning: action.payload as boolean
          }
        }
      };
    case UI_ACTIONS.SET_WEIGHTS_CREATION_ERROR:
      return {
        ...state,
        weights: {
          ...state.weights,
          weightsCreation: {isRunning: false, error: action.payload as string | null}
        }
      };
    case UI_ACTIONS.SET_WEIGHTS_DISTANCE_CONFIG:
      return {
        ...state,
        weights: {
          ...state.weights,
          distanceThresholds: action.payload as DistanceThresholdsProps
        }
      };
    case UI_ACTIONS.SET_DISTANCE_UNIT:
      return {
        ...state,
        weights: {
          ...state.weights,
          distanceUnit: action.payload as 'mile' | 'kilometer'
        }
      };
    default:
      return state;
  }
};
