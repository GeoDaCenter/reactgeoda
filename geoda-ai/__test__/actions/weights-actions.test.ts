import {UI_ACTIONS} from '@/actions/ui-actions';
import {
  WEIGHTS_ACTIONS,
  addWeights,
  removeWeights,
  selectWeights,
  createWeightsAsync,
  calculateDistanceThresholdsAsync,
  DistanceThresholdsProps
} from '@/actions/weights-actions';
import {WeightsProps} from '@/reducers/weights-reducer';
import * as weightsUpdaters from '@/reducers/weights-updaters';
import {CreateWeightsProps, getWeightsId} from '@/utils/weights-utils';
import configureStore from 'redux-mock-store';
import {getDistanceThresholds} from 'geoda-wasm';
const mockStore = configureStore([]);

jest.mock('@/reducers/weights-updaters');

// Update the mock setup at the top of the file
const mockGetDistanceThresholds = jest.fn();
jest.mock('geoda-wasm', () => ({
  getDistanceThresholds: mockGetDistanceThresholds
}));

describe('weights actions', () => {
  const mockWeights: WeightsProps = {
    datasetId: '123',
    weightsMeta: {
      numberOfObservations: 100,
      minNeighbors: 1,
      maxNeighbors: 5,
      meanNeighbors: 3,
      medianNeighbors: 3,
      pctNoneZero: 0.5
    },
    weights: []
  };

  describe('sync actions', () => {
    it('should create an action to add weights', () => {
      const expectedAction = {
        type: WEIGHTS_ACTIONS.ADD_WEIGHS,
        payload: mockWeights
      };
      expect(addWeights(mockWeights)).toEqual(expectedAction);
    });

    it('should create an action to remove weights', () => {
      const expectedAction = {
        type: WEIGHTS_ACTIONS.REMOVE_WEIGHTS,
        payload: {id: '123'}
      };
      expect(removeWeights('123')).toEqual(expectedAction);
    });

    it('should create an action to select weights', () => {
      const expectedAction = {
        type: WEIGHTS_ACTIONS.SELECT_WEIGHTS,
        payload: {id: '123'}
      };
      expect(selectWeights('123')).toEqual(expectedAction);
    });
  });

  describe('async actions', () => {
    let store: any;

    beforeEach(() => {
      store = mockStore({
        root: {
          weights: {weights: [], weightsMeta: {}}
        }
      });
    });

    it('should handle successful weights creation', async () => {
      (weightsUpdaters.createWeightsUpdater as jest.Mock).mockResolvedValue(mockWeights);

      const payload: CreateWeightsProps = {
        datasetId: '123',
        weightsType: 'band',
        binaryGeometries: [],
        binaryGeometryType: {point: false, polygon: true, line: false},
        distanceThreshold: 10,
        isMile: false
      };

      // mock thunk middleware
      const invoke = createWeightsAsync(payload);
      await invoke(store.dispatch, store.getState);

      const actions = store.getActions();

      expect(actions.length).toBe(5);
      expect(actions[0].type).toBe(UI_ACTIONS.SET_START_WEIGHTS_CREATION);
      expect(actions[0].payload).toEqual(true);
      expect(actions[1].type).toBe(WEIGHTS_ACTIONS.ADD_WEIGHS);
      expect(actions[1].payload).toEqual(mockWeights);
      expect(actions[2].type).toBe(UI_ACTIONS.SET_DEFAULT_WEIGHTS_ID);
      expect(actions[2].payload).toEqual(getWeightsId(payload));
      expect(actions[3].type).toBe(UI_ACTIONS.SET_SHOW_WEIGHTS_PANEL);
      expect(actions[3].payload).toEqual(true);
      expect(actions[4].type).toBe(UI_ACTIONS.SET_START_WEIGHTS_CREATION);
      expect(actions[4].payload).toEqual(false);
    });

    it('should handle weights creation error', async () => {
      const errorMessage = 'Creation failed';
      (weightsUpdaters.createWeightsUpdater as jest.Mock).mockRejectedValue(
        new Error(errorMessage)
      );

      const payload: CreateWeightsProps = {
        datasetId: '123',
        weightsType: 'contiguity',
        binaryGeometries: [],
        binaryGeometryType: {point: false, polygon: true, line: false},
        contiguityType: 'queen',
        orderOfContiguity: 1,
        includeLowerOrder: false,
        precisionThreshold: 0
      };

      const invoke = createWeightsAsync(payload);
      await invoke(store.dispatch, store.getState);
      const actions = store.getActions();

      expect(actions[0].type).toBe(UI_ACTIONS.SET_START_WEIGHTS_CREATION);
      expect(actions[0].payload).toEqual(true);
      expect(actions[1].type).toBe(UI_ACTIONS.SET_WEIGHTS_CREATION_ERROR);
      expect(actions[1].payload).toEqual(errorMessage);
      expect(actions[2].type).toBe(UI_ACTIONS.SET_START_WEIGHTS_CREATION);
      expect(actions[2].payload).toEqual(false);
    });

    it('should handle successful distance thresholds calculation', async () => {
      const mockThresholds = {
        minDistance: 0,
        maxDistance: 0,
        maxPairDistance: 0
      };

      mockGetDistanceThresholds.mockResolvedValue(mockThresholds);

      const payload: DistanceThresholdsProps = {
        isMile: false,
        binaryGeometryType: {point: false, polygon: true, line: false},
        binaryGeometries: []
      };

      const invoke = calculateDistanceThresholdsAsync(payload);
      await invoke(store.dispatch);
      const actions = store.getActions();

      expect(actions[0].type).toBe('SET_WEIGHTS_DISTANCE_CONFIG');
      expect(actions[0].payload).toEqual(mockThresholds);
    });

    it.skip('should handle distance thresholds calculation error', async () => {
      const errorMessage = 'Calculation failed';
      mockGetDistanceThresholds.mockRejectedValue(new Error(errorMessage));

      const payload: DistanceThresholdsProps = {
        isMile: false,
        binaryGeometryType: {point: false, polygon: true, line: false},
        binaryGeometries: []
      };

      const invoke = calculateDistanceThresholdsAsync(payload);
      await invoke(store.dispatch);
      
      // Add these checks
      expect(mockGetDistanceThresholds).toHaveBeenCalled();  // Verify the mock was called
      expect(mockGetDistanceThresholds).toHaveBeenCalledWith(  // Verify the arguments
        payload.binaryGeometries,
        payload.isMile
      );

      const actions = store.getActions();
      expect(actions[0].type).toBe(UI_ACTIONS.SET_WEIGHTS_CREATION_ERROR);
      expect(actions[0].payload).toBe(errorMessage);
    });
  });
});
