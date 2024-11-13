import {DistanceThresholdsProps} from '@/reducers/ui-reducer';

export enum UI_ACTIONS {
  SET_THEME = 'SET_THEME',
  SET_DEFAULT_DATASET_ID = 'SET_DEFAULT_DATASET_ID',
  SET_OPEN_FILE_MODAL = 'SET_OPEN_FILE_MODAL',
  SET_OPEN_FILE_MODAL_IS_LOADING = 'SET_OPEN_FILE_MODAL_IS_LOADING',
  SET_OPEN_FILE_MODAL_ERROR = 'SET_OPEN_FILE_MODAL_ERROR',
  SET_ADD_DATASET_MODAL = 'SET_ADD_DATASET_MODAL',
  SET_SAVE_PROJECT_MODAL = 'SET_SAVE_PROJECT_MODAL',
  SET_KEPLER_TABLE_MODAL = 'SET_KEPLER_TABLE_MODAL',
  SET_GRID_VIEW = 'SET_GRID_VIEW',
  SET_SHOW_PROPERTY_PANEL = 'SET_SHOW_PROPERTY_PANEL',
  SET_PROPERTY_PANEL = 'SET_PROPERTY_PANEL',
  SET_SHOW_CHAT_PANEL = 'SET_SHOW_CHAT_PANEL',
  SET_OPENAI_KEY = 'SET_OPENAI_KEY',
  SET_IS_OPENAI_KEY_CHECKED = 'SET_IS_OPENAI_KEY_CHECKED',
  SET_SHOW_QUERY_BUILDER = 'SET_SHOW_QUERY_BUILDER',
  SET_QUERY_CODE = 'SET_QUERY_CODE',
  SET_SCREEN_CAPTURED = 'SET_SCREEN_CAPTURED',
  SET_START_SCREEN_CAPTURE = 'SET_START_SCREEN_CAPTURE',
  SET_DEFAULT_PROMPT_TEXT = 'SET_DEFAULT_PROMPT_TEXT',
  SET_USER_ACTION = 'SET_USER_ACTION',
  SET_USER_ACTION_SCREENSHOT = 'SET_USER_ACTION_SCREENSHOT',
  SET_GUIDING_USER = 'SET_GUIDING_USER',
  SET_IS_PROMPTING = 'SET_IS_PROMPTING',
  SET_DEFAULT_WEIGHTS_ID = 'SET_DEFAULT_WEIGHTS_ID',
  SET_SHOW_WEIGHTS_PANEL = 'SET_SHOW_WEIGHTS_PANEL',
  SET_START_WEIGHTS_CREATION = 'SET_START_WEIGHTS_CREATION',
  SET_WEIGHTS_CREATION_ERROR = 'SET_WEIGHTS_CREATION_ERROR',
  SET_WEIGHTS_DISTANCE_CONFIG = 'SET_WEIGHTS_DISTANCE_CONFIG'
}

export const setTheme = (payload: 'dark' | 'light') => ({
  type: UI_ACTIONS.SET_THEME,
  payload
});

export const setDefaultDatasetId = (payload: string) => ({
  type: UI_ACTIONS.SET_DEFAULT_DATASET_ID,
  payload
});

export const setOpenFileModal = (payload: boolean) => ({
  type: UI_ACTIONS.SET_OPEN_FILE_MODAL,
  payload
});

export const setOpenFileModalIsLoading = (payload: boolean) => ({
  type: UI_ACTIONS.SET_OPEN_FILE_MODAL_IS_LOADING,
  payload
});

export const setOpenFileModalError = (payload: string) => ({
  type: UI_ACTIONS.SET_OPEN_FILE_MODAL_ERROR,
  payload
});

export const setAddDatasetModal = (payload: boolean) => ({
  type: UI_ACTIONS.SET_ADD_DATASET_MODAL,
  payload
});

export const setSaveProjectModal = (payload: boolean) => ({
  type: UI_ACTIONS.SET_SAVE_PROJECT_MODAL,
  payload
});

export const setKeplerTableModal = (payload: boolean) => ({
  type: UI_ACTIONS.SET_KEPLER_TABLE_MODAL,
  payload
});

export const setGridView = (payload: boolean) => ({
  type: UI_ACTIONS.SET_GRID_VIEW,
  payload
});

export const setShowPropertyPanel = (payload: boolean) => ({
  type: UI_ACTIONS.SET_SHOW_PROPERTY_PANEL,
  payload
});

export const setPropertyPanel = (payload: string) => ({
  type: UI_ACTIONS.SET_PROPERTY_PANEL,
  payload
});

export const setShowChatPanel = (payload: boolean) => ({
  type: UI_ACTIONS.SET_SHOW_CHAT_PANEL,
  payload
});

export const setOpenAIKey = (payload: string | undefined) => ({
  type: UI_ACTIONS.SET_OPENAI_KEY,
  payload
});

export const setIsOpenAIKeyChecked = (payload: boolean) => ({
  type: UI_ACTIONS.SET_IS_OPENAI_KEY_CHECKED,
  payload
});

export const setShowQueryBuilder = (payload: boolean) => ({
  type: UI_ACTIONS.SET_SHOW_QUERY_BUILDER,
  payload
});

export const setQueryCode = (payload: string) => ({
  type: UI_ACTIONS.SET_QUERY_CODE,
  payload
});

export const setScreenCaptured = (payload: string) => ({
  type: UI_ACTIONS.SET_SCREEN_CAPTURED,
  payload
});

export const setStartScreenCapture = (payload: boolean) => ({
  type: UI_ACTIONS.SET_START_SCREEN_CAPTURE,
  payload
});

export const setDefaultPromptText = (payload: string) => ({
  type: UI_ACTIONS.SET_DEFAULT_PROMPT_TEXT,
  payload
});

export const setUserAction = (payload: string) => ({
  type: UI_ACTIONS.SET_USER_ACTION,
  payload
});

export const setUserActionScreenshot = (payload: string) => ({
  type: UI_ACTIONS.SET_USER_ACTION_SCREENSHOT,
  payload
});

export const setGuidingUser = (payload: boolean) => ({
  type: UI_ACTIONS.SET_GUIDING_USER,
  payload
});

export const setIsPrompting = (payload: boolean) => ({
  type: UI_ACTIONS.SET_IS_PROMPTING,
  payload
});

export const setDefaultWeightsId = (payload: string) => ({
  type: UI_ACTIONS.SET_DEFAULT_WEIGHTS_ID,
  payload
});

export const setShowWeightsPanel = (payload: boolean) => ({
  type: UI_ACTIONS.SET_SHOW_WEIGHTS_PANEL,
  payload
});

export const setStartWeightsCreation = (payload: boolean) => ({
  type: UI_ACTIONS.SET_START_WEIGHTS_CREATION,
  payload
});

export const setWeightsCreationError = (payload: string | null) => ({
  type: UI_ACTIONS.SET_WEIGHTS_CREATION_ERROR,
  payload
});

export const setWeightsDistanceConfig = (payload: DistanceThresholdsProps) => ({
  type: UI_ACTIONS.SET_WEIGHTS_DISTANCE_CONFIG,
  payload
});
