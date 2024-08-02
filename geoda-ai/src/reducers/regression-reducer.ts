import {
  REGRESSION_ACTIONS,
  RegressionProps,
  RemoveRegressionProps
} from '@/actions/regression-actions';

const initialState: Array<RegressionProps> = [];

export type RegressionAction = {
  type: string;
  payload: RegressionProps | RemoveRegressionProps;
};

export const regressionReducer = (state = initialState, action: RegressionAction) => {
  switch (action.type) {
    case REGRESSION_ACTIONS.ADD_REGRESSION:
      return [...state, action.payload];
    case REGRESSION_ACTIONS.REMOVE_REGRESSION:
      return state.filter(regression => regression.id !== action.payload.id);
    case REGRESSION_ACTIONS.UPDATE_REGRESSION:
      return state.map(regression => {
        if (regression.id === action.payload.id) {
          return {
            ...regression,
            ...action.payload
          };
        }
        return regression;
      });
    default:
      return state;
  }
};
