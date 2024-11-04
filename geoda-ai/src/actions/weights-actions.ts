import {WeightsProps} from '@/reducers/weights-reducer';

export enum WEIGHTS_ACTIONS {
  ADD_WEIGHS = 'ADD_WEIGHTS',
  REMOVE_WEIGHTS = 'REMOVE_WEIGHTS',
  SELECT_WEIGHTS = 'SELECT_WEIGHTS'
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
