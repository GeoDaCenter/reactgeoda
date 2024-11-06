import {WEIGHTS_ACTIONS, RemoveWeightsProps, SelectWeightsProps} from '@/actions/weights-actions';
import {WeightsMeta} from 'geoda-wasm';
import {createWeightsUpdater} from './weights-updaters';

export type WeightsAction = {
  type: string;
  payload: WeightsProps | RemoveWeightsProps | SelectWeightsProps;
};

export type WeightsProps = {
  datasetId: string;
  weightsMeta: WeightsMeta;
  weights: number[][];
  weightsValues?: number[][];
  // isNew is used to determine if the weights are newly added by chatbot, so a number badge can be shown on the weights icon
  isNew?: boolean;
};

const initialState: Array<WeightsProps> = [];

export const weightsReducer = (state = initialState, action: WeightsAction) => {
  switch (action.type) {
    case WEIGHTS_ACTIONS.CREATE_WEIGHTS: {
      const newWeights = createWeightsUpdater(state, action);
      // add weights to the state
      return [...state, ...newWeights];
    }
    case WEIGHTS_ACTIONS.ADD_WEIGHS: {
      // check if the weights already exists
      const existingWeights = state.find(
        weights => weights.weightsMeta.id === (action.payload as WeightsProps).weightsMeta.id
      );
      // if the weights already exists, update the weights by setting isNew to true
      if (existingWeights) {
        return state.map(weights =>
          weights.weightsMeta.id === (action.payload as WeightsProps).weightsMeta.id
            ? {...weights, isNew: true}
            : weights
        );
      }
      // if the weights does not exist, add the new weights to the state
      return [...state, action.payload];
    }
    case WEIGHTS_ACTIONS.REMOVE_WEIGHTS: {
      const {id} = action.payload as RemoveWeightsProps;
      return state.filter(weights => weights.weightsMeta.id !== id);
    }
    case WEIGHTS_ACTIONS.SELECT_WEIGHTS: {
      const {id} = action.payload as SelectWeightsProps;
      // update selected weights by setting isNew to true
      return state.map(weights =>
        weights.weightsMeta.id === id ? {...weights, isNew: true} : weights
      );
    }
    default:
      return state;
  }
};
