import {createWeights} from '@/actions/weights-actions';
import {WeightsAction, WeightsProps} from './weights-reducer';

export async function createWeightsUpdater(state: WeightsProps[], action: WeightsAction) {
  const payload = action.payload as WeightsProps;
  const result = await createWeights(payload);
  return result ? [result] : [];
}

export function addWeightsUpdater(state: WeightsProps[], action: WeightsAction) {
  const payload = action.payload as WeightsProps;
  // check if the weights already exists
  const existingWeights = state.find(weights => weights.weightsMeta.id === payload.weightsMeta.id);
  // if the weights already exists, update the weights by setting isNew to true
  if (existingWeights) {
    return state.map(weights =>
      weights.weightsMeta.id === payload.weightsMeta.id ? {...weights, isNew: true} : weights
    );
  }
  // if the weights does not exist, add the new weights to the state
  return [...state, payload];
}
