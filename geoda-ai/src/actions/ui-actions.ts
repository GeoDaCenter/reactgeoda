export enum UI_ACTIONS {
  SET_THEME = 'SET_THEME',
  SET_OPEN_FILE_MODAL = 'SET_OPEN_FILE_MODAL',
  SET_SAVE_PROJECT_MODAL = 'SET_SAVE_PROJECT_MODAL',
  SET_KEPLER_TABLE_MODAL = 'SET_KEPLER_TABLE_MODAL',
  SET_GRID_VIEW = 'SET_GRID_VIEW',
  SET_SHOW_PROPERTY_PANEL = 'SET_SHOW_PROPERTY_PANEL',
  SET_PROPERTY_PANEL = 'SET_PROPERTY_PANEL',
  SET_OPENAI_KEY = 'SET_OPENAI_KEY'
}

export const setTheme = (payload: 'dark' | 'light') => ({
  type: UI_ACTIONS.SET_THEME,
  payload
});

export const setOpenFileModal = (payload: boolean) => ({
  type: UI_ACTIONS.SET_OPEN_FILE_MODAL,
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

export const setOpenAIKey = (payload: string) => ({
  type: UI_ACTIONS.SET_OPENAI_KEY,
  payload
});
