import {BinaryGeometryType, WeightsMeta} from 'geoda-wasm';
import {createErrorResult} from '../custom-functions';
import {isGeojsonLayer, isPointLayer} from '@/utils/data-utils';
import {
  checkWeightsIdExist,
  createContiguityWeights,
  createDistanceWeights,
  createKNNWeights,
  CreateWeightsProps
} from '@/utils/weights-utils';
import {VisState} from '@kepler.gl/schemas';
import {CHAT_DATASET_NOT_FOUND} from '@/constants';
import {Layer} from '@kepler.gl/layers';
import {
  getBinaryGeometriesFromLayer,
  getBinaryGeometryTypeFromLayer
} from '@/components/spatial-operations/spatial-join-utils';
import {BinaryFeatureCollection} from '@loaders.gl/schema';
import {
  CallbackFunctionProps,
  CustomFunctionContext,
  CustomFunctionOutputProps,
  ErrorCallbackResult,
  RegisterFunctionCallingProps
} from '@openassistant/core';
import {customWeightsMessageCallback} from '@/components/chatgpt/custom-weights-message';
import {WeightsProps} from '@/reducers/weights-reducer';

export const createWeightsFunctionDefinition = (
  context: CustomFunctionContext<VisState | WeightsProps[]>
): RegisterFunctionCallingProps => ({
  name: 'createWeights',
  description:
    'Create a spatial weights, which could be k nearest neighbor (knn) weights, queen contiguity weights, rook contiguity weights, distance based weights or kernel weights.',
  properties: {
    type: {
      type: 'string',
      description: 'The type of spatial weights. It could be knn, queen, rook, distance or kernel.'
    },
    k: {
      type: 'number',
      description:
        'This parameter is only used in k nearest neighbor (knn) weights creation. It represents the number of nearby neighbors that are closest to each observation. The number of k should be larger than 1.'
    },
    orderOfContiguity: {
      type: 'number',
      description:
        'This parameter is only used in queen or rook weights creation. It represents the order or distance of contiguity from each geometry. The default order of contiguity is 1.'
    },
    includeLowerOrder: {
      type: 'boolean',
      description:
        'This parameter is only used in queen or rook weights creation. It represents whether or not the lower order neighbors should be included. The default value is False.'
    },
    precisionThreshold: {
      type: 'number',
      description:
        'This parameter only used in queen or rook weights creation. It represnts the precision threshold that allow for an exact match of coordinates, so we can use it to determine which polygons are neighbors that sharing the proximate coordinates or edges. The default value is 0.'
    },
    distanceThreshold: {
      type: 'number',
      description:
        'This parameter only used in distance based weights creation. It represents the distance threshold used to search nearby neighbors for each geometry. The unit should be either kilometer (KM) or mile.'
    },
    isMile: {
      type: 'boolean',
      description:
        'This parameter only used in distance based weights creation. It represents whether the distance threshold is in mile or not. The default value is False.'
    },
    datasetName: {
      type: 'string',
      description:
        'The name of the dataset. If not provided, please try to use the first dataset name.'
    }
  },
  required: ['type', 'datasetName'],
  callbackFunction: createWeightsCallback,
  callbackFunctionContext: context,
  callbackMessage: customWeightsMessageCallback
});

export type WeightsCallbackResult = {
  success: true;
  datasetId: string;
} & WeightsMeta;

type WeightsData = {
  weightsMeta: WeightsMeta;
  weights: number[][];
  datasetId: string;
};

export type WeightsCallbackOutput = CustomFunctionOutputProps<
  WeightsCallbackResult | ErrorCallbackResult,
  WeightsData
>;

type CreateWeightsCallbackProps = {
  type: 'knn' | 'queen' | 'rook' | 'distance' | 'kernel';
  k?: number;
  orderOfContiguity?: number;
  includeLowerOrder?: boolean;
  precisionThreshold?: number;
  distanceThreshold?: number;
  datasetName?: string;
  isMile?: boolean;
};

export async function createWeightsCallback({
  functionName,
  functionArgs,
  functionContext
}: CallbackFunctionProps): Promise<WeightsCallbackOutput> {
  const {
    type,
    k: inputK,
    orderOfContiguity: inputOrderOfContiguity,
    includeLowerOrder: inputIncludeLowerOrder,
    precisionThreshold: inputPrecisionThreshold,
    distanceThreshold: inputDistanceThreshold,
    isMile: inputIsMile,
    datasetName
  } = functionArgs as CreateWeightsCallbackProps;
  const {visState, weights} = functionContext as {visState: VisState; weights: WeightsProps[]};

  // convert inputK to number if it is not
  let k = inputK;
  if (typeof inputK === 'string') {
    k = parseInt(inputK, 10);
  }
  // convert inputOrderOfContiguity to number if it is not
  let orderOfContiguity = inputOrderOfContiguity;
  if (typeof inputOrderOfContiguity === 'string') {
    orderOfContiguity = parseInt(inputOrderOfContiguity, 10);
  }
  // convert inputIncludeLowerOrder to boolean if it is not
  let includeLowerOrder = inputIncludeLowerOrder;
  if (typeof inputIncludeLowerOrder === 'string') {
    includeLowerOrder = inputIncludeLowerOrder === 'true';
  }
  // convert inputPrecisionThreshold to number if it is not
  let precisionThreshold = inputPrecisionThreshold;
  if (typeof inputPrecisionThreshold === 'string') {
    precisionThreshold = parseFloat(inputPrecisionThreshold);
  }
  // convert inputDistanceThreshold to number if it is not
  let distanceThreshold = inputDistanceThreshold;
  if (typeof inputDistanceThreshold === 'string') {
    distanceThreshold = parseFloat(inputDistanceThreshold);
  }
  // convert inputIsMile to boolean if it is not
  let isMile = inputIsMile;
  if (typeof inputIsMile === 'string') {
    isMile = inputIsMile === 'true';
  }

  // get dataset using dataset name from visState
  const keplerDataset =
    Object.values(visState.datasets).find(d => d.label === datasetName) ||
    Object.values(visState.datasets)[0];

  if (!keplerDataset) {
    return createErrorResult({name: functionName, result: CHAT_DATASET_NOT_FOUND});
  }

  // get kepler layer from dataset
  const layer = visState.layers.find((layer: Layer) => {
    if (layer.config.dataId === keplerDataset.id) {
      return isGeojsonLayer(layer) || isPointLayer(layer);
    }
    return false;
  });

  if (!layer) {
    return createErrorResult({name: functionName, result: CHAT_DATASET_NOT_FOUND});
  }

  const binaryGeometryType = getBinaryGeometryTypeFromLayer(layer);
  const binaryGeometries = getBinaryGeometriesFromLayer(layer, keplerDataset);

  if (!binaryGeometries || !binaryGeometryType) {
    return createErrorResult({
      name: functionName,
      result: `Error: geometries in layer is empty. Please add a valid layer from the dataset ${keplerDataset.label}.`
    });
  }

  let w = null;

  if (type === 'knn' && k && k > 0) {
    w = await kNNWeights(weights, keplerDataset.id, k, binaryGeometryType, binaryGeometries);
  } else if (type === 'queen' || type === 'rook') {
    w = await contiguityWeights(
      weights,
      keplerDataset.id,
      type,
      orderOfContiguity || 1,
      includeLowerOrder || false,
      precisionThreshold || 0,
      binaryGeometryType,
      binaryGeometries
    );
  } else if (type === 'distance' && distanceThreshold) {
    w = await distanceWeights(
      weights,
      keplerDataset.id,
      distanceThreshold,
      isMile || false,
      binaryGeometryType,
      binaryGeometries
    );
  }

  if (w) {
    return {
      type: 'weights',
      name: functionName,
      result: {
        success: true,
        datasetId: keplerDataset.id,
        ...w.weightsMeta
      },
      data: {
        datasetId: keplerDataset.id,
        weights: w.weights,
        weightsMeta: w.weightsMeta
      }
    };
  }

  return createErrorResult({name: functionName, result: 'Error: weights type is not supported'});
}

function getWeightsFromWeightsData(
  createWeightsProps: CreateWeightsProps,
  weightsData: WeightsProps[]
) {
  const existingWeightData = checkWeightsIdExist(createWeightsProps, weightsData);
  if (existingWeightData) {
    return {weightsMeta: existingWeightData.weightsMeta, weights: existingWeightData.weights};
  }
  return null;
}

async function kNNWeights(
  weightsData: WeightsProps[],
  datasetId: string,
  k: number,
  binaryGeometryType: BinaryGeometryType,
  binaryGeometries: BinaryFeatureCollection[]
) {
  const createWeightsProps: CreateWeightsProps = {
    weightsType: 'knn',
    datasetId,
    k,
    binaryGeometryType,
    // @ts-ignore
    binaryGeometries
  };

  const existingWeightData = getWeightsFromWeightsData(createWeightsProps, weightsData);
  if (existingWeightData) {
    return {weightsMeta: existingWeightData.weightsMeta, weights: existingWeightData.weights};
  }

  const {weights, weightsMeta} = await createKNNWeights(createWeightsProps);

  return {weightsMeta, weights};
}

async function contiguityWeights(
  weightsData: WeightsProps[],
  datasetId: string,
  contiguityType: 'queen' | 'rook',
  orderOfContiguity: number,
  includeLowerOrder: boolean,
  precisionThreshold: number,
  binaryGeometryType: BinaryGeometryType,
  binaryGeometries: BinaryFeatureCollection[]
) {
  const createWeightsProps: CreateWeightsProps = {
    weightsType: 'contiguity',
    datasetId,
    contiguityType,
    binaryGeometryType,
    // @ts-ignore
    binaryGeometries,
    precisionThreshold: precisionThreshold || 0,
    orderOfContiguity: orderOfContiguity || 1,
    includeLowerOrder: includeLowerOrder || false
  };

  const existingWeightData = getWeightsFromWeightsData(createWeightsProps, weightsData);
  if (existingWeightData) {
    return {weightsMeta: existingWeightData.weightsMeta, weights: existingWeightData.weights};
  }

  const {weights, weightsMeta} = await createContiguityWeights(createWeightsProps);

  return {weightsMeta, weights};
}

async function distanceWeights(
  weightsData: WeightsProps[],
  datasetId: string,
  distanceThreshold: number,
  isMile: boolean,
  binaryGeometryType: BinaryGeometryType,
  binaryGeometries: BinaryFeatureCollection[]
) {
  const createWeightsProps: CreateWeightsProps = {
    datasetId,
    weightsType: 'band',
    distanceThreshold,
    isMile,
    binaryGeometryType,
    // @ts-ignore
    binaryGeometries
  };

  const existingWeightData = getWeightsFromWeightsData(createWeightsProps, weightsData);
  if (existingWeightData) {
    return {weightsMeta: existingWeightData.weightsMeta, weights: existingWeightData.weights};
  }

  const {weights, weightsMeta} = await createDistanceWeights(createWeightsProps);

  return {weightsMeta, weights};
}
