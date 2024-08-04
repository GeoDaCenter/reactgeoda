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
  datasetId: string;
  weightsType: 'contiguity';
  contiguityType: string;
  binaryGeometryType: BinaryGeometryType;
  binaryGeometries: BinaryFeatureCollection[];
  precisionThreshold: number;
  orderOfContiguity: number;
  includeLowerOrder: boolean;
};

export async function createContiguityWeights({
  datasetId,
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
    id: `w-${datasetId}-${contiguityType}-${orderOfContiguity}${includeLowerOrder ? '-lower' : ''}`,
    type: contiguityType === 'queen' ? 'queen' : 'rook',
    symmetry: 'symmetric',
    order: orderOfContiguity,
    includeLowerOrder,
    threshold: precisionThreshold
  };
  return {weights, weightsMeta};
}

export type CreateKNNWeightsProps = {
  datasetId: string;
  weightsType: 'knn';
  k: number;
  binaryGeometryType: BinaryGeometryType;
  binaryGeometries: BinaryFeatureCollection[];
};

export async function createKNNWeights({
  datasetId,
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
    id: `w-${datasetId}-${k}-nn`,
    type: 'knn',
    symmetry: 'symmetric',
    k
  };
  return {weights, weightsMeta};
}

export type CreateDistanceWeightsProps = {
  datasetId: string;
  weightsType: 'band';
  distanceThreshold: number;
  isMile: boolean;
  binaryGeometryType: BinaryGeometryType;
  binaryGeometries: BinaryFeatureCollection[];
};

export async function createDistanceWeights({
  datasetId,
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
    id: `w-${datasetId}-distance-${distanceThresholdString}${isMile ? '-mile' : 'km'}`,
    type: 'threshold',
    symmetry: 'symmetric',
    threshold: distanceThreshold,
    isMile
  };
  return {weights, weightsMeta};
}

export type CreateWeightsProps = {
  datasetId: string;
} & (CreateContiguityWeightsProps | CreateKNNWeightsProps | CreateDistanceWeightsProps);

export async function createWeights(props: CreateWeightsProps) {
  let result: CreateWeightsOutputProps | null = null;

  if (props.weightsType === 'contiguity') {
    result = await createContiguityWeights({
      datasetId: props.datasetId,
      weightsType: props.weightsType,
      contiguityType: props.contiguityType,
      binaryGeometryType: props.binaryGeometryType,
      // @ts-ignore
      binaryGeometries: props.binaryGeometries,
      precisionThreshold: props.precisionThreshold,
      orderOfContiguity: props.orderOfContiguity,
      includeLowerOrder: props.includeLowerOrder
    });
  } else if (props.weightsType === 'knn') {
    const k = props.k;
    result = await createKNNWeights({
      datasetId: props.datasetId,
      weightsType: props.weightsType,
      k,
      binaryGeometryType: props.binaryGeometryType,
      // @ts-ignore
      binaryGeometries: props.binaryGeometries
    });
  } else if (props.weightsType === 'band') {
    result = await createDistanceWeights({
      datasetId: props.datasetId,
      weightsType: props.weightsType,
      distanceThreshold: props.distanceThreshold,
      isMile: props.isMile,
      binaryGeometryType: props.binaryGeometryType,
      // @ts-ignore
      binaryGeometries: props.binaryGeometries
    });
  }

  // const {weights, weightsMeta} = result;
  return result;
}
