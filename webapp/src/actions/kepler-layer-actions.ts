export const SET_CHOROPLETH_LAYER = 'SET_CHOROPLETH_LAYER';
export const SET_CHOROPLETH_DATA = 'SET_CHOROPLETH_DATA';
export const SET_LOCAL_MORAN_LAYER = 'SET_LOCAL_MORAN_LAYER';
export const SET_LOCAL_MORAN_DATA = 'SET_LOCAL_MORAN_DATA';

export const setChoroplethLayer = (layer: any) => ({
  type: SET_CHOROPLETH_LAYER,
  payload: layer
});

export const setChoroplethData = (rows: string[]) => ({
  type: SET_CHOROPLETH_DATA,
  payload: rows
});

export const setLocalMoranLayer = (layer: any) => ({
  type: SET_LOCAL_MORAN_LAYER,
  payload: layer
});

export const setLocalMoranData = (rows: string[]) => ({
  type: SET_LOCAL_MORAN_DATA,
  payload: rows
});
