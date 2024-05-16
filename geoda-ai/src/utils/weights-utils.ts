import {
  getContiguityNeighborsFromBinaryGeometries,
  getMetaFromWeights,
  WeightsMeta,
  BinaryGeometryType,
  getNearestNeighborsFromBinaryGeometries,
  getDistanceNeighborsFromBinaryGeometries
} from 'geoda-wasm';
import {BinaryFeatureCollection} from '@loaders.gl/schema';

export type CreateWeightsOutputProps = {
  weights: number[][];
  weightsMeta: WeightsMeta;
};

export type CreateContiguityWeightsProps = {
  contiguityType: string;
  binaryGeometryType: BinaryGeometryType;
  binaryGeometries: BinaryFeatureCollection[];
  precisionThreshold: number;
  orderOfContiguity: number;
  includeLowerOrder: boolean;
};

export async function createContiguityWeights({
  contiguityType,
  binaryGeometryType,
  binaryGeometries,
  precisionThreshold,
  orderOfContiguity,
  includeLowerOrder
}: CreateContiguityWeightsProps) {
  const isQueen = contiguityType === 'queen';
  const useCentroids = binaryGeometryType.point || binaryGeometryType.line;
  const weights = await getContiguityNeighborsFromBinaryGeometries({
    binaryGeometryType,
    binaryGeometries,
    isQueen,
    useCentroids,
    precisionThreshold,
    orderOfContiguity,
    includeLowerOrder
  });
  const weightsMeta: WeightsMeta = {
    ...getMetaFromWeights(weights),
    id: `w-${contiguityType}-contiguity-${orderOfContiguity}${includeLowerOrder ? '-lower' : ''}`,
    type: contiguityType === 'queen' ? 'queen' : 'rook',
    symmetry: 'symmetric',
    order: orderOfContiguity,
    includeLowerOrder,
    threshold: precisionThreshold
  };
  return {weights, weightsMeta};
}

export type CreateKNNWeightsProps = {
  k: number;
  binaryGeometryType: BinaryGeometryType;
  binaryGeometries: BinaryFeatureCollection[];
};

export async function createKNNWeights({
  k,
  binaryGeometryType,
  binaryGeometries
}: CreateKNNWeightsProps) {
  const weights = await getNearestNeighborsFromBinaryGeometries({
    k,
    binaryGeometryType,
    binaryGeometries
  });
  const weightsMeta: WeightsMeta = {
    ...getMetaFromWeights(weights),
    id: `w-${k}-nn`,
    type: 'knn',
    symmetry: 'symmetric',
    k
  };
  return {weights, weightsMeta};
}

export type CreateDistanceWeightsProps = {
  distanceThreshold: number;
  isMile: boolean;
  binaryGeometryType: BinaryGeometryType;
  binaryGeometries: BinaryFeatureCollection[];
};

export async function createDistanceWeights({
  distanceThreshold,
  isMile,
  binaryGeometryType,
  binaryGeometries
}: CreateDistanceWeightsProps): Promise<CreateWeightsOutputProps> {
  const weights = await getDistanceNeighborsFromBinaryGeometries({
    distanceThreshold,
    isMile,
    binaryGeometryType,
    binaryGeometries
  });
  // convert distanceThreshold to string and keep one decimal
  const distanceThresholdString = distanceThreshold.toFixed(1);

  const weightsMeta: WeightsMeta = {
    ...getMetaFromWeights(weights),
    id: `w-distance-${distanceThresholdString}${isMile ? '-mile' : 'km'}`,
    type: 'threshold',
    symmetry: 'symmetric',
    threshold: distanceThreshold,
    isMile
  };
  return {weights, weightsMeta};
}
