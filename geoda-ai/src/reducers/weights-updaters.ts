import {WeightsAction, WeightsProps} from './weights-reducer';
import {checkWeightsIdExist, createWeights, CreateWeightsProps} from '@/utils/weights-utils';

export async function createWeightsUpdater(
  weightsProps: CreateWeightsProps,
  weightsData: WeightsProps[]
) {
  const isWeightsIdExist = checkWeightsIdExist(weightsProps, weightsData);
  if (!isWeightsIdExist) {
    const result = await createWeights(weightsProps);
    if (!result) {
      throw new Error('weights.error.typeNotSupported');
    }
    return result;
  }
  // if the weights already exists, return null
  return null;
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
