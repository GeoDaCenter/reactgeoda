// define a type of custom function that is an object contains key-value pairs

import {MAP_ID} from '@/constants';
import {getColumnData, getTableSummary} from '@/hooks/use-duckdb';
import {GeoDaState} from '@/store';
import {
  quantileBreaks,
  naturalBreaks,
  getNearestNeighborsFromBinaryGeometries,
  WeightsMeta,
  getMetaFromWeights,
  localMoran
} from 'geoda-wasm';
import {getKeplerLayer} from './data-utils';

// define enum for custom function names
export enum CustomFunctionNames {
  SUMMARIZE_DATA = 'summarizeData',
  QUANTILE_BREAKS = 'quantileBreaks',
  NATURAL_BREAKS = 'naturalBreaks',
  KNN_WEIGHT = 'knnWeight',
  LOCAL_MORAN = 'univariateLocalMoran'
}

// key is the name of the function, value is the function itself
type CustomFunctions = {
  [key: string]: (...args: any[]) => any;
};

type SummarizeDataProps = {
  tableName?: string;
  result?: string;
};

type CustomMapBreaksProps = {
  k: number;
  variableName: string;
};

export type ErrorOutput = {
  result: string;
};

export type WeightsOutput = {
  type: 'weights';
  name: string;
  result: WeightsMeta;
  data: number[][];
};

export type MappingOutput = {
  type: 'mapping';
  name: string;
  result: number[];
};

export type UniLocalMoranOutput = {
  type: 'lisa';
  name: string;
  result: {
    significanceThreshold: number;
    permutations: number;
    variableName: string;
    weightsID: string;
    numberOfHighHighClusters: number;
    numberOfLowLowClusters: number;
    numberOfHighLowClusters: number;
    numberOfLowHighClusters: number;
    numberOfIsolatedClusters: number;
    globalMoranI: number;
  };
  data: any;
};

export const CUSTOM_FUNCTIONS: CustomFunctions = {
  summarizeData: async function ({tableName}: SummarizeDataProps) {
    // dispatch summarize data action
    console.log('calling summarizeData() with arguments:', tableName);
    const result = await getTableSummary();
    return {tableName, result};
  },

  quantileBreaks: async function ({
    k,
    variableName
  }: CustomMapBreaksProps): Promise<MappingOutput | ErrorOutput> {
    const columnData = await getColumnData(variableName);
    if (!columnData || columnData.length === 0) {
      return {result: 'column data is empty'};
    }
    const result = await quantileBreaks(k, columnData);

    return {type: 'mapping', name: 'Quantile Breaks', result};
  },

  naturalBreaks: async function ({k, variableName}: CustomMapBreaksProps) {
    const columnData = await getColumnData(variableName);
    if (!columnData || columnData.length === 0) {
      return {result: 'column data is empty'};
    }
    const result = await naturalBreaks(k, columnData);

    return {type: 'mapping', name: 'Natural Breaks', result};
  },

  knnWeight: async function ({k}, geodaState: GeoDaState): Promise<WeightsOutput | ErrorOutput> {
    // get table name from geodaState
    const tableName = geodaState.root.file.rawFileData.name;
    if (!tableName) {
      return {result: 'table name is empty'};
    }
    // get kepler.gl visState
    const visState = geodaState.keplerGl[MAP_ID].visState;

    // get kepler.gl layer using tableName
    const keplerLayer = getKeplerLayer(tableName, visState);

    if (!keplerLayer) {
      return {result: 'layer is empty'};
    }

    const binaryGeometryType = keplerLayer.meta.featureTypes;
    const binaryGeometries = keplerLayer.dataToFeature;
    if (!binaryGeometries || !binaryGeometryType) {
      return {result: 'geometries in layer is empty'};
    }

    const weights = await getNearestNeighborsFromBinaryGeometries({
      k,
      binaryGeometryType,
      // @ts-ignore
      binaryGeometries
    });
    const weightsMeta: WeightsMeta = {
      ...getMetaFromWeights(weights),
      id: `w-${k}-nn`,
      type: 'knn',
      symmetry: 'asymmetric',
      k
    };

    return {
      type: 'weights',
      name: 'KNN',
      result: weightsMeta,
      data: weights
    };
  },

  univariateLocalMoran: async function (
    {variableName, weightsID, permutations = 999, significanceThreshold = 0.05},
    geodaState: GeoDaState
  ): Promise<UniLocalMoranOutput | ErrorOutput> {
    // get weights using weightsID
    let selectWeight = geodaState.root.weights.find(w => w.weightsMeta.id === weightsID);
    if (geodaState.root.weights.length === 0) {
      return {result: 'weights is empty. Please create a spatial weights first'};
    }
    if (!selectWeight) {
      // using last weights if weightsID is not found
      selectWeight = geodaState.root.weights[geodaState.root.weights.length - 1];
    }

    // get table name from geodaState
    const tableName = geodaState.root.file.rawFileData.name;
    if (!tableName) {
      return {result: 'table name is empty'};
    }
    // get column data
    const columnData = await getColumnData(variableName);
    if (!columnData || columnData.length === 0) {
      return {result: 'column data is empty'};
    }
    // run LISA analysis
    const lm = await localMoran(columnData, selectWeight?.weights, permutations);
    // get cluster values using significant cutoff
    const clusters = lm.pValues.map((p: number, i) => {
      if (p > significanceThreshold) {
        return 0;
      }
      return lm.clusters[i];
    });

    return {
      type: 'lisa',
      name: 'Local Moran',
      result: {
        significanceThreshold,
        permutations,
        variableName,
        weightsID,
        numberOfHighHighClusters: clusters.filter(c => c === 1).length,
        numberOfLowLowClusters: clusters.filter(c => c === 2).length,
        numberOfHighLowClusters: clusters.filter(c => c === 3).length,
        numberOfLowHighClusters: clusters.filter(c => c === 4).length,
        numberOfIsolatedClusters: clusters.filter(c => c === 5).length,
        globalMoranI: lm.lisaValues.reduce((a, b) => a + b, 0) / lm.lisaValues.length
      },
      data: lm
    };
  }
};
