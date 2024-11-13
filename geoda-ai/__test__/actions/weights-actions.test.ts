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

jest.mock('@/reducers/weights-updaters');

const mockStore = configureStore([]);

/**
 * binary geometry template, see deck.gl BinaryGeometry
 */
export function getBinaryGeometryTemplate() {
  return {
    globalFeatureIds: {value: new Uint32Array(0), size: 1},
    positions: {value: new Float32Array(0), size: 2},
    properties: [],
    numericProps: {},
    featureIds: {value: new Uint32Array(0), size: 1}
  };
}

describe('weights actions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

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

      // make sure createWeightsUpdater is called
      expect(weightsUpdaters.createWeightsUpdater).toHaveBeenCalled();

      const actions = store.getActions();

      expect(actions[0].type).toBe(UI_ACTIONS.SET_START_WEIGHTS_CREATION);
      expect(actions[0].payload).toEqual(true);
      expect(actions[1].type).toBe(UI_ACTIONS.SET_WEIGHTS_CREATION_ERROR);
      expect(actions[1].payload).toEqual(errorMessage);
      expect(actions[2].type).toBe(UI_ACTIONS.SET_START_WEIGHTS_CREATION);
      expect(actions[2].payload).toEqual(false);
    });

    it('should handle distance thresholds calculation error', async () => {
      const payload: DistanceThresholdsProps = {
        isMile: false,
        binaryGeometryType: {point: false, polygon: true, line: false},
        // @ts-ignore trigger error
        binaryGeometries: null
      };

      const invoke = calculateDistanceThresholdsAsync(payload);
      await invoke(store.dispatch);

      const actions = store.getActions();
      expect(actions[0].type).toBe(UI_ACTIONS.SET_WEIGHTS_CREATION_ERROR);
    });

    it('should handle successful distance thresholds calculation', async () => {
      const payload: DistanceThresholdsProps = {
        isMile: false,
        binaryGeometryType: {point: true, polygon: false, line: false},
        binaryGeometries: [
          {
            shape: 'binary-feature-collection',
            points: {
              ...getBinaryGeometryTemplate(),
              type: 'Point',
              globalFeatureIds: {value: new Uint32Array([0, 1]), size: 1},
              positions: {value: new Float64Array([1, 1, 2, 2]), size: 2},
              properties: [{index: 0}, {index: 1}],
              featureIds: {value: new Uint32Array([0, 1]), size: 1}
            },
            lines: {
              ...getBinaryGeometryTemplate(),
              type: 'LineString',
              pathIndices: {value: new Uint16Array(0), size: 1}
            },
            polygons: {
              ...getBinaryGeometryTemplate(),
              type: 'Polygon',
              polygonIndices: {value: new Uint16Array(0), size: 1},
              primitivePolygonIndices: {value: new Uint16Array(0), size: 1}
            }
          }
        ]
      };

      const invoke = calculateDistanceThresholdsAsync(payload);
      await invoke(store.dispatch);

      const actions = store.getActions();

      expect(actions[0].type).toBe('SET_WEIGHTS_DISTANCE_CONFIG');
      expect(actions[0].payload).toEqual({
        minDistance: 157.22560925091383,
        maxDistance: 157.22560925091383,
        maxPairDistance: 157.22560925091383
      });
    });
  });
});
