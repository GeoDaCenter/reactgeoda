import {WEIGHTS_ACTIONS, AddWeightsProps, RemoveWeightsProps} from '@/actions/weights-actions';

const initialState: Array<any> = [];

export type WeightsAction = {
  type: string;
  payload: AddWeightsProps | RemoveWeightsProps;
};

export const weightsReducer = (state = initialState, action: WeightsAction) => {
  switch (action.type) {
    case WEIGHTS_ACTIONS.ADD_WEIGHS:
      return [...state, action.payload];
    case WEIGHTS_ACTIONS.REMOVE_WEIGHTS:
      return state.filter(weights => weights.id !== action.payload);
    default:
      return state;
  }
};
