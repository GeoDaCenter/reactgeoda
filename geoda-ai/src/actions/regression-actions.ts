import {RegressionProps} from '@/reducers/regression-reducer';
import {runRegression, RunRegressionProps} from '@/utils/regression-utils';
import {generateRandomId} from '@/utils/ui-utils';
import {Dispatch} from 'react';
import {UnknownAction} from 'redux';

export enum REGRESSION_ACTIONS {
  ADD_REGRESSION = 'ADD_REGRESSION',
  REMOVE_REGRESSION = 'REMOVE_REGRESSION',
  UPDATE_REGRESSION = 'UPDATE_REGRESSION'
}

export type RemoveRegressionProps = {
  id: string;
};

export type UpdadateRegressionProps = {
  id: string;
  isNew: boolean;
};

// action creators
export const addRegression = (newRegression: RegressionProps) => ({
  type: REGRESSION_ACTIONS.ADD_REGRESSION,
  payload: newRegression
});

export const removeRegression = (id: string) => ({
  type: REGRESSION_ACTIONS.REMOVE_REGRESSION,
  payload: {id}
});

export const updateRegression = (id: string, isNew: boolean) => ({
  type: REGRESSION_ACTIONS.UPDATE_REGRESSION,
  payload: {id, isNew}
});

// thunk action creators
export const runRegressionAsync =
  (props: RunRegressionProps) => async (dispatch: Dispatch<UnknownAction>) => {
    const result = await runRegression(props);
    // generate random id
    const id = generateRandomId();
    // dispatch action to create regression and add to store
    dispatch(addRegression({id, type: 'regression', data: result}));
  };
