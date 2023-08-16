import {
  SET_LOCAL_MORAN_LAYER,
  SET_LOCAL_MORAN_DATA,
  SET_CHOROPLETH_LAYER,
  SET_CHOROPLETH_DATA
} from '../actions';

export type KeplerLayerAction = {
  type: string;
  payload: any;
};

export const localMoranLayerReducer = (state = {}, action: KeplerLayerAction) => {
  switch (action.type) {
    case SET_LOCAL_MORAN_LAYER:
      return action.payload;
    default:
      return state;
  }
};

export const choroplethLayerReducer = (state = {}, action: KeplerLayerAction) => {
  switch (action.type) {
    case SET_CHOROPLETH_LAYER:
      return action.payload;
    default:
      return state;
  }
};

export const localMoranDataReducer = (state = {}, action: KeplerLayerAction) => {
  switch (action.type) {
    case SET_LOCAL_MORAN_DATA:
      return action.payload;
    default:
      return state;
  }
};

export const choroplethDataReducer = (state = {}, action: KeplerLayerAction) => {
  switch (action.type) {
    case SET_CHOROPLETH_DATA:
      return action.payload;
    default:
      return state;
  }
};
