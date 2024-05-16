import {WeightsMeta} from 'geoda-wasm';
import {createErrorResult, CustomFunctionContext, ErrorOutput} from '../custom-functions';
import {getKeplerLayer} from '@/utils/data-utils';
import {
  createContiguityWeights,
  createDistanceWeights,
  createKNNWeights
} from '@/utils/weights-utils';

export type WeightsOutput = {
  type: 'weights';
  name: string;
  result: WeightsMeta;
  data: number[][];
};

export type CreateWeightsCallbackProps = {
  type: 'knn' | 'queen' | 'rook' | 'distance' | 'kernel';
  k?: number;
  orderOfContiguity?: number;
  includeLowerOrder?: boolean;
  precisionThreshold?: number;
  distanceThreshold?: number;
};

export async function createWeightsCallback(
  {
    type,
    k,
    orderOfContiguity,
    includeLowerOrder,
    precisionThreshold,
    distanceThreshold
  }: CreateWeightsCallbackProps,
  {tableName, visState}: CustomFunctionContext
): Promise<WeightsOutput | ErrorOutput> {
  if (type === 'knn' && k && k > 0) {
    return kNNWeights({k}, {tableName, visState});
  } else if (type === 'queen' || type === 'rook') {
    return contiguityWeights(
      {contiguityType: type, orderOfContiguity, includeLowerOrder, precisionThreshold},
      {tableName, visState}
    );
  } else if (type === 'distance' && distanceThreshold) {
    return distanceWeights({distanceThreshold}, {tableName, visState});
  }
  return createErrorResult('Error: weights type is not supported');
}

async function kNNWeights(
  {k}: {k: number},
  {tableName, visState}: CustomFunctionContext
): Promise<WeightsOutput | ErrorOutput> {
  if (!tableName) {
    return createErrorResult('Error: table name is empty');
  }

  // get kepler.gl layer using tableName
  const keplerLayer = getKeplerLayer(tableName, visState);
  if (!keplerLayer) {
    return createErrorResult('Error: layer is empty');
  }

  const binaryGeometryType = keplerLayer.meta.featureTypes;
  const binaryGeometries = keplerLayer.dataToFeature;
  if (!binaryGeometries || !binaryGeometryType) {
    return createErrorResult('Error: geometries in layer is empty');
  }

  const {weights, weightsMeta} = await createKNNWeights({
    k,
    binaryGeometryType,
    // @ts-ignore
    binaryGeometries
  });

  return {
    type: 'weights',
    name: 'KNN',
    result: weightsMeta,
    data: weights
  };
}

export type ContiguityWeightsCallbackProps = Omit<CreateWeightsCallbackProps, 'k' | 'type'> & {
  contiguityType: 'queen' | 'rook';
};

async function contiguityWeights(
  {
    contiguityType,
    orderOfContiguity,
    includeLowerOrder,
    precisionThreshold
  }: ContiguityWeightsCallbackProps,
  {tableName, visState}: CustomFunctionContext
): Promise<WeightsOutput | ErrorOutput> {
  if (!tableName) {
    return createErrorResult('Error: table name is empty');
  }
  // get kepler.gl layer using tableName
  const keplerLayer = getKeplerLayer(tableName, visState);
  if (!keplerLayer) {
    return createErrorResult('Error: layer is empty');
  }

  const binaryGeometryType = keplerLayer.meta.featureTypes;
  const binaryGeometries = keplerLayer.dataToFeature;
  if (!binaryGeometries || !binaryGeometryType) {
    return createErrorResult('Error: geometries in layer is empty');
  }

  if (!contiguityType) {
    return createErrorResult('Error: contiguity type is empty');
  }

  const {weights, weightsMeta} = await createContiguityWeights({
    contiguityType,
    binaryGeometryType,
    // @ts-ignore
    binaryGeometries,
    precisionThreshold: precisionThreshold || 0,
    orderOfContiguity: orderOfContiguity || 1,
    includeLowerOrder: includeLowerOrder || false
  });

  return {
    type: 'weights',
    name: 'Contiguity',
    result: weightsMeta,
    data: weights
  };
}

async function distanceWeights(
  {distanceThreshold}: {distanceThreshold: number},
  {tableName, visState}: CustomFunctionContext
): Promise<WeightsOutput | ErrorOutput> {
  if (!tableName) {
    return createErrorResult('Error: table name is empty');
  }
  // get kepler.gl layer using tableName
  const keplerLayer = getKeplerLayer(tableName, visState);
  if (!keplerLayer) {
    return createErrorResult('Error: layer is empty');
  }

  const binaryGeometryType = keplerLayer.meta.featureTypes;
  const binaryGeometries = keplerLayer.dataToFeature;
  if (!binaryGeometries || !binaryGeometryType) {
    return createErrorResult('Error: geometries in layer is empty');
  }

  const {weights, weightsMeta} = await createDistanceWeights({
    distanceThreshold,
    binaryGeometryType,
    // @ts-ignore
    binaryGeometries
  });

  return {
    type: 'weights',
    name: 'Distance',
    result: weightsMeta,
    data: weights
  };
}
