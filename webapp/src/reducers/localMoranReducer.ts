import {
  SET_SELECTED_LOCAL_MORAN_VARIABLE,
  SET_LOCAL_MORAN_WEIGHTS,
  SET_LOCAL_MORAN_SIGNIFICANCE,
  SET_UNIVARIATE_AUTOCORRELATION_TYPE
} from '../actions';

export const selectedLocalMoranVariableReducer = (state = '', action: any) => {
  switch (action.type) {
    case SET_SELECTED_LOCAL_MORAN_VARIABLE:
      return action.payload;
    default:
      return state;
  }
};

export const localMoranWeightsReducer = (state = 'rook', action: any) => {
  switch (action.type) {
    case SET_LOCAL_MORAN_WEIGHTS:
      return action.payload;
    default:
      return state;
  }
};

export const localMoranSignificanceReducer = (state = 0.05, action: any) => {
  switch (action.type) {
    case SET_LOCAL_MORAN_SIGNIFICANCE:
      return action.payload;
    default:
      return state;
  }
};

export const univariateAutocorrelationTypeReducer = (state = '', action: any) => {
  switch (action.type) {
    case SET_UNIVARIATE_AUTOCORRELATION_TYPE:
      return action.payload;
    default:
      return state;
  }
};
