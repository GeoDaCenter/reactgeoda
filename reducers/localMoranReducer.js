import {
  SET_SELECTED_LOCAL_MORAN_VARIABLE,
  SET_LOCAL_MORAN_WEIGHTS,
  SET_LOCAL_MORAN_SIGNIFICANCE
} from '../actions';

export const selectedLocalMoranVariableReducer = (state = '', action) => {
  switch (action.type) {
    case SET_SELECTED_LOCAL_MORAN_VARIABLE:
      return action.payload;
    default:
      return state;
  }
};

export const localMoranWeightsReducer = (state = 'rook', action) => {
  switch (action.type) {
    case SET_LOCAL_MORAN_WEIGHTS:
      return action.payload;
    default:
      return state;
  }
};

export const localMoranSignificanceReducer = (state = 0.05, action) => {
  switch (action.type) {
    case SET_LOCAL_MORAN_SIGNIFICANCE:
      return action.payload;
    default:
      return state;
  }
};
