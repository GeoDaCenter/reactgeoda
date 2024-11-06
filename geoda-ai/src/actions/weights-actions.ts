import {WeightsProps} from '@/reducers/weights-reducer';

export enum WEIGHTS_ACTIONS {
  ADD_WEIGHS = 'ADD_WEIGHTS',
  REMOVE_WEIGHTS = 'REMOVE_WEIGHTS',
  SELECT_WEIGHTS = 'SELECT_WEIGHTS',
  CREATE_WEIGHTS = 'CREATE_WEIGHTS',
  CREATE_WEIGHTS_START = 'CREATE_WEIGHTS_START',
  CREATE_WEIGHTS_SUCCESS = 'CREATE_WEIGHTS_SUCCESS',
  CREATE_WEIGHTS_ERROR = 'CREATE_WEIGHTS_ERROR'
}

export type RemoveWeightsProps = {
  id: string;
};

export type SelectWeightsProps = {
  id: string;
};

// action creators
export const addWeights = (newWeights: WeightsProps) => ({
  type: WEIGHTS_ACTIONS.ADD_WEIGHS,
  payload: newWeights
});

export const removeWeights = (id: string) => ({
  type: WEIGHTS_ACTIONS.REMOVE_WEIGHTS,
  payload: {id}
});

export const selectWeights = (id: string) => ({
  type: WEIGHTS_ACTIONS.SELECT_WEIGHTS,
  payload: {id}
});

export const createWeights = (weights: WeightsProps) => ({
  type: WEIGHTS_ACTIONS.CREATE_WEIGHTS,
  payload: weights
});
