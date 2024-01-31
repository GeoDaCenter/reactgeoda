import {WeightsMeta} from 'geoda-wasm';

export enum WEIGHTS_ACTIONS {
  ADD_WEIGHS = 'ADD_WEIGHTS',
  REMOVE_WEIGHTS = 'REMOVE_WEIGHTS'
}

export type WeightsProps = {
  weightsMeta: WeightsMeta;
  weights: number[][];
  // isNew is used to determine if the weights are newly added by chatbot, so a number badge can be shown on the weights icon
  isNew?: boolean;
};

export type RemoveWeightsProps = {
  id: string;
};

export const addWeights = (newWeights: WeightsProps) => ({
  type: WEIGHTS_ACTIONS.ADD_WEIGHS,
  payload: newWeights
});

export const removeWeights = (id: string) => ({
  type: WEIGHTS_ACTIONS.REMOVE_WEIGHTS,
  payload: {id}
});
