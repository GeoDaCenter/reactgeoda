export enum UI_ACTIONS {
  SET_OPEN_FILE_MODAL = 'SET_OPEN_FILE_MODAL'
}

export const setOpenFileModal = (payload: boolean) => ({
  type: UI_ACTIONS.SET_OPEN_FILE_MODAL,
  payload
});
