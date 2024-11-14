import {createWeightsUpdater, addWeightsUpdater} from '@/reducers/weights-updaters';
import {WeightsProps, WeightsAction} from '@/reducers/weights-reducer';
import {CreateWeightsProps} from '@/utils/weights-utils';
import * as weightsUtils from '@/utils/weights-utils';

// Mock the weights-utils module
jest.mock('@/utils/weights-utils');

describe('weights-updaters', () => {
  const mockWeightsProps: CreateWeightsProps = {
    datasetId: 'dataset1',
    weightsType: 'contiguity',
    contiguityType: 'queen',
    orderOfContiguity: 1,
    binaryGeometryType: {point: true, polygon: false, line: false},
    binaryGeometries: [],
    precisionThreshold: 0.001,
    includeLowerOrder: false
  };

  const mockWeightsData: WeightsProps = {
    datasetId: 'dataset1',
    weightsMeta: {
      id: 'weights1',
      name: 'Queen Weights',
      type: 'queen',
      order: 1,
      numberOfObservations: 2,
      minNeighbors: 0,
      maxNeighbors: 1,
      meanNeighbors: 0.5,
      medianNeighbors: 0.5,
      nonZeroCount: 2,
      pctNoneZero: 1
    },
    weights: [
      [1, 0],
      [0, 1]
    ],
    isNew: false
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createWeightsUpdater', () => {
    it('should create weights when id does not exist', async () => {
      (weightsUtils.checkWeightsIdExist as jest.Mock).mockReturnValue(false);
      (weightsUtils.createWeights as jest.Mock).mockResolvedValue(mockWeightsData);

      const result = await createWeightsUpdater(mockWeightsProps, []);

      expect(result).toEqual(mockWeightsData);
      expect(weightsUtils.createWeights).toHaveBeenCalledWith(mockWeightsProps);
    });

    it('should return null when weights id already exists', async () => {
      (weightsUtils.checkWeightsIdExist as jest.Mock).mockReturnValue(true);

      const result = await createWeightsUpdater(mockWeightsProps, [mockWeightsData]);

      expect(result).toBeNull();
      expect(weightsUtils.createWeights).not.toHaveBeenCalled();
    });

    it('should throw error when weights creation fails', async () => {
      (weightsUtils.checkWeightsIdExist as jest.Mock).mockReturnValue(false);
      (weightsUtils.createWeights as jest.Mock).mockResolvedValue(null);

      await expect(createWeightsUpdater(mockWeightsProps, [])).rejects.toThrow(
        'weights.error.typeNotSupported'
      );
    });

    it('should throw error when weights creation fails', async () => {
      (weightsUtils.createWeights as jest.Mock).mockRejectedValue(
        new Error('weights creation failed because of unknown error')
      );

      await expect(createWeightsUpdater(mockWeightsProps, [])).rejects.toThrow(
        'weights creation failed because of unknown error'
      );
    });
  });

  describe('addWeightsUpdater', () => {
    it('should add new weights when they do not exist', () => {
      const action: WeightsAction = {
        type: 'ADD_WEIGHTS',
        payload: mockWeightsData
      };

      const result = addWeightsUpdater([], action);

      expect(result).toEqual([mockWeightsData]);
    });

    it('should update existing weights with isNew flag', () => {
      const action: WeightsAction = {
        type: 'ADD_WEIGHTS',
        payload: mockWeightsData
      };

      const initialState = [mockWeightsData];
      const result = addWeightsUpdater(initialState, action);

      expect(result[0].isNew).toBe(true);
      expect(result).toHaveLength(1);
    });
  });
});
