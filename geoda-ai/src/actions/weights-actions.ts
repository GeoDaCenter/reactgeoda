import {WeightsMeta} from 'geoda-wasm';

export enum WEIGHTS_ACTIONS {
  ADD_WEIGHS = 'ADD_WEIGHTS',
  REMOVE_WEIGHTS = 'REMOVE_WEIGHTS'
}

export type AddWeightsProps = {
  weightsMeta: WeightsMeta;
  weights: number[][];
};

export type RemoveWeightsProps = {
  id: string;
};

export const addWeights = (newWeights: AddWeightsProps) => ({
  type: WEIGHTS_ACTIONS.ADD_WEIGHS,
  payload: newWeights
});

export const removeWeights = (id: string) => ({
  type: WEIGHTS_ACTIONS.REMOVE_WEIGHTS,
  payload: {id}
});
