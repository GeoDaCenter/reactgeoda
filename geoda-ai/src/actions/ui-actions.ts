export enum UI_ACTIONS {
  SET_OPEN_FILE_MODAL = 'SET_OPEN_FILE_MODAL',
  SET_KEPLER_TABLE_MODAL = 'SET_KEPLER_TABLE_MODAL',
  SET_GRID_VIEW = 'SET_GRID_VIEW'
}

export const setOpenFileModal = (payload: boolean) => ({
  type: UI_ACTIONS.SET_OPEN_FILE_MODAL,
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
