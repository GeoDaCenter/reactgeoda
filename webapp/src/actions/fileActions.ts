export const SET_FILE_DATA = 'SET_FILE_DATA';
export const SET_RAW_FILE_DATA = 'SET_RAW_FILE_DATA';
export const setFileData = (data: any) => ({
  type: SET_FILE_DATA,
  payload: data
});

export const setRawFileData = (data: any) => ({
  // for jsgeoda
  type: SET_RAW_FILE_DATA,
  payload: data
});
