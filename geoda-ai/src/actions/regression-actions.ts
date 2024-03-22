import {LinearRegressionResult} from 'geoda-wasm';

export enum REGRESSION_ACTIONS {
  ADD_REGRESSION = 'ADD_REGRESSION',
  REMOVE_REGRESSION = 'REMOVE_REGRESSION'
}

export type RegressionDataProps = {
  dependentVariable: string;
  independentVariables: string[];
  weights?: string;
  dependentVariableData: number[];
  independentVariablesData: number[][];
  result: LinearRegressionResult;
};

export type RegressionProps = {
  id: string;
  // isNew is used to determine if the regression are newly added by chatbot, so a number badge can be shown on the regression icon
  isNew?: boolean;
  type: string;
  data: RegressionDataProps;
};

export type RemoveRegressionProps = {
  id: string;
};

export const addRegression = (newRegression: RegressionProps) => ({
  type: REGRESSION_ACTIONS.ADD_REGRESSION,
  payload: newRegression
});

export const removeRegression = (id: string) => ({
  type: REGRESSION_ACTIONS.REMOVE_REGRESSION,
  payload: {id}
});
