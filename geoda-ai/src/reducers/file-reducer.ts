import {FILE_ACTIONS, DatasetProps} from '../actions';

export type DatasetsAction = {
  type: string;
  payload: DatasetProps;
};

const INITIAL_DATASETS_STATE: DatasetProps[] = [];

// updater function to set dataset
export function addDatasetUpdater(state: DatasetProps[], action: {payload: DatasetProps}) {
  // state should be empty, when setting a new dataset, it should be the only dataset
  return [...state, action.payload];
}

const fileReducer = (state = INITIAL_DATASETS_STATE, action: DatasetsAction) => {
  switch (action.type) {
    case FILE_ACTIONS.ADD_DATASET:
      return addDatasetUpdater(state, action);
    default:
      return state;
  }
};

export default fileReducer;
