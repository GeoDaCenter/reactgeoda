export const SET_CHOROPLETH_LAYER = 'SET_CHOROPLETH_LAYER';
export const SET_CHOROPLETH_DATA = 'SET_CHOROPLETH_DATA';
export const SET_LOCAL_MORAN_LAYER = 'SET_LOCAL_MORAN_LAYER';
export const SET_LOCAL_MORAN_DATA = 'SET_LOCAL_MORAN_DATA';

export const setChoroplethLayer = layer => ({
  type: SET_CHOROPLETH_LAYER,
  payload: layer
});

export const setChoroplethData = rows => ({
  type: SET_CHOROPLETH_DATA,
  payload: rows
});

export const setLocalMoranLayer = layer => ({
  type: SET_LOCAL_MORAN_LAYER,
  payload: layer
});

export const setLocalMoranData = rows => ({
  type: SET_LOCAL_MORAN_DATA,
  payload: rows
});
