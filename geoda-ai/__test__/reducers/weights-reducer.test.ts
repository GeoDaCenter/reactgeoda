import {weightsReducer} from '@/reducers/weights-reducer';
import {WEIGHTS_ACTIONS} from '@/actions/weights-actions';
import {WeightsMeta} from 'geoda-wasm';

describe('weightsReducer', () => {
  // Sample test data
  const sampleWeightsMeta: WeightsMeta = {
    id: 'weight1',
    name: 'Weight 1',
    type: 'queen',
    order: 1,
    numberOfObservations: 2,
    minNeighbors: 1,
    maxNeighbors: 1,
    meanNeighbors: 1,
    medianNeighbors: 1,
    pctNoneZero: 1
  };

  const sampleWeights: number[][] = [
    [0, 1],
    [1, 0]
  ];

  const sampleWeightsProps = {
    datasetId: 'dataset1',
    weightsMeta: sampleWeightsMeta,
    weights: sampleWeights,
    isNew: false
  };

  it('should return initial state', () => {
    expect(weightsReducer(undefined, {type: 'UNKNOWN', payload: {}} as any)).toEqual([]);
  });

  describe('ADD_WEIGHS', () => {
    it('should add new weights when they do not exist', () => {
      const action = {
        type: WEIGHTS_ACTIONS.ADD_WEIGHS,
        payload: sampleWeightsProps
      };

      const newState = weightsReducer([], action);
      expect(newState).toHaveLength(1);
      expect(newState[0]).toEqual(sampleWeightsProps);
    });

    it('should update existing weights by setting isNew to true', () => {
      const initialState = [sampleWeightsProps];
      const action = {
        type: WEIGHTS_ACTIONS.ADD_WEIGHS,
        payload: sampleWeightsProps
      };

      const newState = weightsReducer(initialState, action);
      expect(newState).toHaveLength(1);
      expect(newState[0].isNew).toBe(true);
    });
  });

  describe('REMOVE_WEIGHTS', () => {
    it('should remove weights with matching id', () => {
      const initialState = [sampleWeightsProps];
      const action = {
        type: WEIGHTS_ACTIONS.REMOVE_WEIGHTS,
        payload: {id: 'weight1'}
      };

      const newState = weightsReducer(initialState, action);
      expect(newState).toHaveLength(0);
    });

    it('should not remove weights with non-matching id', () => {
      const initialState = [sampleWeightsProps];
      const action = {
        type: WEIGHTS_ACTIONS.REMOVE_WEIGHTS,
        payload: {id: 'nonexistent'}
      };

      const newState = weightsReducer(initialState, action);
      expect(newState).toHaveLength(1);
    });
  });

  describe('SELECT_WEIGHTS', () => {
    it('should set isNew to true for selected weights', () => {
      const initialState = [sampleWeightsProps];
      const action = {
        type: WEIGHTS_ACTIONS.SELECT_WEIGHTS,
        payload: {id: 'weight1'}
      };

      const newState = weightsReducer(initialState, action);
      expect(newState[0].isNew).toBe(true);
    });

    it('should not modify other weights when selecting', () => {
      const otherWeights = {
        ...sampleWeightsProps,
        weightsMeta: {...sampleWeightsMeta, id: 'weight2'}
      };
      const initialState = [sampleWeightsProps, otherWeights];
      const action = {
        type: WEIGHTS_ACTIONS.SELECT_WEIGHTS,
        payload: {id: 'weight1'}
      };

      const newState = weightsReducer(initialState, action);
      expect(newState[0].isNew).toBe(true);
      expect(newState[1].isNew).toBe(false);
    });
  });
});
