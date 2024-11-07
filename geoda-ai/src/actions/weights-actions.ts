import {WeightsProps} from '@/reducers/weights-reducer';
import {createWeightsUpdater} from '@/reducers/weights-updaters';
import {GeoDaState} from '@/store';
import {CreateWeightsProps, getWeightsId} from '@/utils/weights-utils';
import {Dispatch} from 'react';
import {UnknownAction} from 'redux';
import {setDefaultWeightsId} from './ui-actions';

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

// action creators for async actions
export function createWeightsAsync(payload: CreateWeightsProps) {
  return async (dispatch: Dispatch<UnknownAction>, getState: () => GeoDaState) => {
    const weightsData = getState().root.weights;
    const newWeights = await createWeightsUpdater(payload, weightsData);
    if (newWeights) {
      const {weights, weightsMeta} = newWeights;
      dispatch(addWeights({weights, weightsMeta, datasetId: payload.datasetId}));
    }
    // set the default weights id
    dispatch(setDefaultWeightsId(getWeightsId(payload)));
  };
}
