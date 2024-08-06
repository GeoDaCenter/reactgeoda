import {LinearRegressionResult, SpatialErrorResult, SpatialLagResult} from 'geoda-wasm';
import {REGRESSION_ACTIONS, RemoveRegressionProps} from '@/actions/regression-actions';

export type RegressionDataProps = {
  dependentVariable: string;
  independentVariables: string[];
  weights?: string;
  dependentVariableData?: number[];
  independentVariablesData?: number[][];
  modelType?: string;
  datasetName?: string;
  result: LinearRegressionResult | SpatialLagResult | SpatialErrorResult | null;
};

export type RegressionProps = {
  id: string;
  // isNew is used to determine if the regression are newly added by chatbot, so a number badge can be shown on the regression icon
  isNew?: boolean;
  type: string;
  data: RegressionDataProps;
};

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
