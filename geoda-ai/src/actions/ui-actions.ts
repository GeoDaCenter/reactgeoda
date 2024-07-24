export enum UI_ACTIONS {
  SET_THEME = 'SET_THEME',
  SET_OPEN_FILE_MODAL = 'SET_OPEN_FILE_MODAL',
  SET_ADD_DATASET_MODAL = 'SET_ADD_DATASET_MODAL',
  SET_SAVE_PROJECT_MODAL = 'SET_SAVE_PROJECT_MODAL',
  SET_KEPLER_TABLE_MODAL = 'SET_KEPLER_TABLE_MODAL',
  SET_GRID_VIEW = 'SET_GRID_VIEW',
  SET_SHOW_PROPERTY_PANEL = 'SET_SHOW_PROPERTY_PANEL',
  SET_PROPERTY_PANEL = 'SET_PROPERTY_PANEL',
  SET_OPENAI_KEY = 'SET_OPENAI_KEY',
  SET_IS_OPENAI_KEY_CHECKED = 'SET_IS_OPENAI_KEY_CHECKED',
  SET_SHOW_QUERY_BUILDER = 'SET_SHOW_QUERY_BUILDER',
  SET_QUERY_CODE = 'SET_QUERY_CODE',
  SET_SCREEN_CAPTURED = 'SET_SCREEN_CAPTURED',
  SET_START_SCREEN_CAPTURE = 'SET_START_SCREEN_CAPTURE',
  SET_DEFAULT_PROMPT_TEXT = 'SET_DEFAULT_PROMPT_TEXT'
}

export const setTheme = (payload: 'dark' | 'light') => ({
  type: UI_ACTIONS.SET_THEME,
  payload
});

export const setOpenFileModal = (payload: boolean) => ({
  type: UI_ACTIONS.SET_OPEN_FILE_MODAL,
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
