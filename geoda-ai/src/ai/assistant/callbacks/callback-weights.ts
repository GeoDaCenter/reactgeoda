import {BinaryGeometryType, WeightsMeta} from 'geoda-wasm';
import {createErrorResult, ErrorOutput} from '../custom-functions';
import {isGeojsonLayer, isPointLayer} from '@/utils/data-utils';
import {
  createContiguityWeights,
  createDistanceWeights,
  createKNNWeights
} from '@/utils/weights-utils';
import {VisState} from '@kepler.gl/schemas';
import {CHAT_DATASET_NOT_FOUND} from '@/constants';
import {Layer} from '@kepler.gl/layers';
import {
  getBinaryGeometriesFromLayer,
  getBinaryGeometryTypeFromLayer
} from '@/components/spatial-operations/spatial-join-utils';
import {BinaryFeatureCollection} from '@loaders.gl/schema';
import {CustomFunctionOutputProps} from '@/ai/types';

export type WeightsResult = {
  datasetId: string;
  weightsMeta: WeightsMeta;
};

type WeightsData = number[][];

export type WeightsCallbackOutput = CustomFunctionOutputProps<WeightsResult, WeightsData> & {
  type: 'weights';
};

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

export async function createWeightsCallback(
  functionName: string,
  {
    type,
    k,
    orderOfContiguity,
    includeLowerOrder,
    precisionThreshold,
    distanceThreshold,
    isMile,
    datasetName
  }: CreateWeightsCallbackProps,
  {visState}: {visState: VisState}
): Promise<WeightsCallbackOutput | ErrorOutput> {
  // get dataset using dataset name from visState
  const keplerDataset = Object.values(visState.datasets).find(d => d.label === datasetName);

  if (!datasetName || !keplerDataset) {
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
    w = await kNNWeights(keplerDataset.id, k, binaryGeometryType, binaryGeometries);
  } else if (type === 'queen' || type === 'rook') {
    w = await contiguityWeights(
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
        weightsMeta: w.weightsMeta,
        datasetId: keplerDataset.id
      },
      data: w.weights
    };
  }

  return createErrorResult({name: functionName, result: 'Error: weights type is not supported'});
}

async function kNNWeights(
  datasetId: string,
  k: number,
  binaryGeometryType: BinaryGeometryType,
  binaryGeometries: BinaryFeatureCollection[]
) {
  const {weights, weightsMeta} = await createKNNWeights({
    weightsType: 'knn',
    datasetId,
    k,
    binaryGeometryType,
    // @ts-ignore
    binaryGeometries
  });

  return {weightsMeta, weights};
}

async function contiguityWeights(
  datasetId: string,
  contiguityType: 'queen' | 'rook',
  orderOfContiguity: number,
  includeLowerOrder: boolean,
  precisionThreshold: number,
  binaryGeometryType: BinaryGeometryType,
  binaryGeometries: BinaryFeatureCollection[]
) {
  const {weights, weightsMeta} = await createContiguityWeights({
    weightsType: 'contiguity',
    datasetId,
    contiguityType,
    binaryGeometryType,
    // @ts-ignore
    binaryGeometries,
    precisionThreshold: precisionThreshold || 0,
    orderOfContiguity: orderOfContiguity || 1,
    includeLowerOrder: includeLowerOrder || false
  });

  return {weightsMeta, weights};
}

async function distanceWeights(
  datasetId: string,
  distanceThreshold: number,
  isMile: boolean,
  binaryGeometryType: BinaryGeometryType,
  binaryGeometries: BinaryFeatureCollection[]
) {
  const {weights, weightsMeta} = await createDistanceWeights({
    datasetId,
    weightsType: 'band',
    distanceThreshold,
    isMile,
    binaryGeometryType,
    // @ts-ignore
    binaryGeometries
  });

  return {weightsMeta, weights};
}
