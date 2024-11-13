import {
  createWeights,
  getWeightsId,
  checkWeightsIdExist,
  CreateWeightsProps
} from '@/utils/weights-utils';
import {WeightsMeta} from 'geoda-wasm';
import {WeightsProps} from '@/reducers/weights-reducer';
import {binaryPointGeometries} from '../data/binary-geometries';

describe('weights-utils', () => {
  describe('getWeightsId', () => {
    it('should generate correct id for contiguity weights', () => {
      const props: CreateWeightsProps = {
        datasetId: 'test1',
        weightsType: 'contiguity',
        contiguityType: 'queen',
        binaryGeometryType: {point: true, polygon: false, line: false},
        binaryGeometries: binaryPointGeometries,
        precisionThreshold: 0.001,
        orderOfContiguity: 1,
        includeLowerOrder: false
      };
      expect(getWeightsId(props)).toBe('w-test1-queen-1');
    });

    it('should generate correct id for knn weights', () => {
      const props: CreateWeightsProps = {
        datasetId: 'test1',
        weightsType: 'knn',
        k: 4,
        binaryGeometryType: {point: true, polygon: false, line: false},
        binaryGeometries: binaryPointGeometries
      };
      expect(getWeightsId(props)).toBe('w-test1-4-nn');
    });

    it('should generate correct id for distance band weights', () => {
      const props: CreateWeightsProps = {
        datasetId: 'test1',
        weightsType: 'band',
        distanceThreshold: 100.0,
        isMile: true,
        binaryGeometryType: {point: true, polygon: false, line: false},
        binaryGeometries: binaryPointGeometries
      };
      expect(getWeightsId(props)).toBe('w-test1-distance-100.0-mile');
    });

    it('should throw error for unsupported weights type', () => {
      const props = {datasetId: 'test1', weightsType: 'invalid'};
      // @ts-expect-error invalid weights
      expect(() => getWeightsId(props)).toThrow('weights type is not supported');
    });
  });

  describe('checkWeightsIdExist', () => {
    const existingWeights: WeightsProps[] = [
      {
        datasetId: 'test1',
        weights: [[]],
        weightsMeta: {
          id: 'w-test1-queen-1',
          type: 'queen',
          numberOfObservations: 0,
          minNeighbors: 0,
          maxNeighbors: 0,
          meanNeighbors: 0,
          medianNeighbors: 0,
          pctNoneZero: 0
        }
      }
    ];

    it('should return true when weights id exists', () => {
      const props: CreateWeightsProps = {
        datasetId: 'test1',
        weightsType: 'contiguity',
        contiguityType: 'queen',
        binaryGeometryType: {point: true, polygon: false, line: false},
        binaryGeometries: binaryPointGeometries,
        precisionThreshold: 0.001,
        orderOfContiguity: 1,
        includeLowerOrder: false
      };
      expect(checkWeightsIdExist(props, existingWeights)).toBeTruthy();
    });

    it('should return undefined when weights id does not exist', () => {
      const props: CreateWeightsProps = {
        datasetId: 'test1',
        weightsType: 'knn',
        k: 4,
        binaryGeometryType: {point: true, polygon: false, line: false},
        binaryGeometries: binaryPointGeometries
      };
      expect(checkWeightsIdExist(props, existingWeights)).toBeUndefined();
    });
  });

  describe('createWeights', () => {
    it('should create contiguity weights', async () => {
      const props: CreateWeightsProps = {
        datasetId: 'test1',
        weightsType: 'contiguity',
        contiguityType: 'queen',
        binaryGeometryType: {point: true, polygon: false, line: false},
        binaryGeometries: binaryPointGeometries,
        precisionThreshold: 0.001,
        orderOfContiguity: 1,
        includeLowerOrder: false
      };
      const result = await createWeights(props);
      expect(result).toBeDefined();
      expect(result?.weightsMeta.type).toBe('queen');
    });

    it('should create knn weights', async () => {
      const props: CreateWeightsProps = {
        datasetId: 'test1',
        weightsType: 'knn',
        k: 4,
        binaryGeometryType: {point: true, polygon: false, line: false},
        binaryGeometries: binaryPointGeometries
      };
      const result = await createWeights(props);
      expect(result).toBeDefined();
      expect(result?.weightsMeta.type).toBe('knn');
    });

    it('should create distance band weights', async () => {
      const props: CreateWeightsProps = {
        datasetId: 'test1',
        weightsType: 'band',
        distanceThreshold: 100.0,
        isMile: true,
        binaryGeometryType: {point: true, polygon: false, line: false},
        binaryGeometries: binaryPointGeometries
      };
      const result = await createWeights(props);
      expect(result).toBeDefined();
      expect(result?.weightsMeta.type).toBe('threshold');
    });
  });
});
