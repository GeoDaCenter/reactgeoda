import {
  SET_SELECTED_LOCAL_MORAN_VARIABLE,
  SET_LOCAL_MORAN_WEIGHTS,
  SET_LOCAL_MORAN_SIGNIFICANCE,
  SET_UNIVARIATE_AUTOCORRELATION_TYPE
} from '../actions';

export type LocalMoranAction = {
  type: string;
  payload: any;
};

export const selectedLocalMoranVariableReducer = (state = '', action: LocalMoranAction) => {
  switch (action.type) {
    case SET_SELECTED_LOCAL_MORAN_VARIABLE:
      return action.payload;
    default:
      return state;
  }
};

export const localMoranWeightsReducer = (state = 'rook', action: LocalMoranAction) => {
  switch (action.type) {
    case SET_LOCAL_MORAN_WEIGHTS:
      return action.payload;
    default:
      return state;
  }
};

export const localMoranSignificanceReducer = (state = 0.05, action: LocalMoranAction) => {
  switch (action.type) {
    case SET_LOCAL_MORAN_SIGNIFICANCE:
      return action.payload;
    default:
      return state;
  }
};

export const univariateAutocorrelationTypeReducer = (state = '', action: LocalMoranAction) => {
  switch (action.type) {
    case SET_UNIVARIATE_AUTOCORRELATION_TYPE:
      return action.payload;
    default:
      return state;
  }
};
