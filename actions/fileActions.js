export const SET_FILE_DATA = 'SET_FILE_DATA';
export const SET_RAW_FILE_DATA = 'SET_RAW_FILE_DATA';
export const setFileData = data => ({
  type: SET_FILE_DATA,
  payload: data
});

export const setRawFileData = data => ({
  // for jsgeoda
  type: SET_RAW_FILE_DATA,
  payload: data
});
