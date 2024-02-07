// define a type of custom function that is an object contains key-value pairs

import {
  quantileBreaks,
  naturalBreaks,
  getNearestNeighborsFromBinaryGeometries,
  WeightsMeta,
  getMetaFromWeights,
  localMoran
} from 'geoda-wasm';

import {getTableSummary} from '@/hooks/use-duckdb';
import {
  checkIfFieldNameExists,
  getColumnDataFromKeplerLayer,
  getKeplerLayer,
  getColumnData
} from './data-utils';
import {
  CHAT_FIELD_NAME_NOT_FOUND,
  CHAT_COLUMN_DATA_NOT_FOUND,
  CHAT_WEIGHTS_NOT_FOUND
} from '@/constants';
import {WeightsProps} from '@/actions';
import {HistogramDataProps, createHistogram} from './histogram-utils';

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

export type HistogramOutput = {
  type: 'histogram';
  name: string;
  result: {
    id: string;
    variableName: string;
    numberOfBins: number;
    histogram: Array<Omit<HistogramDataProps, 'items'>>;
  };
  data: HistogramDataProps[];
};

// define enum for custom function names, the value of each enum is
// the name of the function that is defined in OpenAI assistant model
export enum CustomFunctionNames {
  SUMMARIZE_DATA = 'summarizeData',
  QUANTILE_BREAKS = 'quantileBreaks',
  NATURAL_BREAKS = 'naturalBreaks',
  KNN_WEIGHT = 'knnWeight',
  LOCAL_MORAN = 'univariateLocalMoran',
  HISTOGRAM = 'histogram'
}

export const CUSTOM_FUNCTIONS: CustomFunctions = {
  summarizeData: async function ({tableName}: SummarizeDataProps) {
    // dispatch summarize data action
    console.log('calling summarizeData() with arguments:', tableName);
    const result = await getTableSummary();
    return {tableName, result};
  },

  quantileBreaks: async function (
    {k, variableName}: CustomMapBreaksProps,
    {tableName, visState}
  ): Promise<MappingOutput | ErrorOutput> {
    if (!checkIfFieldNameExists(tableName, variableName, visState)) {
      return {
        result: `${CHAT_FIELD_NAME_NOT_FOUND} For example, create a quantile map using variable HR60 and 5 quantiles.`
      };
    }
    const columnData = getColumnDataFromKeplerLayer(tableName, variableName, visState.datasets);
    if (!columnData || columnData.length === 0) {
      return {result: CHAT_COLUMN_DATA_NOT_FOUND};
    }
    const result = await quantileBreaks(k, columnData);

    return {type: 'mapping', name: 'Quantile Breaks', result};
  },

  naturalBreaks: async function ({k, variableName}: CustomMapBreaksProps, {tableName, visState}) {
    if (!checkIfFieldNameExists(tableName, variableName, visState)) {
      return {
        result: `${CHAT_FIELD_NAME_NOT_FOUND} For example, create a jenks map using variable HR60 and 5 breaks.`
      };
    }
    const columnData = getColumnDataFromKeplerLayer(tableName, variableName, visState.datasets);
    if (!columnData || columnData.length === 0) {
      return {result: CHAT_COLUMN_DATA_NOT_FOUND};
    }
    const result = await naturalBreaks(k, columnData);

    return {type: 'mapping', name: 'Natural Breaks', result};
  },

  knnWeight: async function ({k}, {tableName, visState}): Promise<WeightsOutput | ErrorOutput> {
    if (!tableName) {
      return {result: 'Error: table name is empty'};
    }

    // get kepler.gl layer using tableName
    const keplerLayer = getKeplerLayer(tableName, visState);
    if (!keplerLayer) {
      return {result: 'Error: layer is empty'};
    }

    const binaryGeometryType = keplerLayer.meta.featureTypes;
    const binaryGeometries = keplerLayer.dataToFeature;
    if (!binaryGeometries || !binaryGeometryType) {
      return {result: 'Error: geometries in layer is empty'};
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
    {tableName, visState, weights}
  ): Promise<UniLocalMoranOutput | ErrorOutput> {
    // get weights using weightsID
    let selectWeight = weights.find((w: WeightsProps) => w.weightsMeta.id === weightsID);
    if (weights.length === 0) {
      return {result: CHAT_WEIGHTS_NOT_FOUND};
    }
    if (!selectWeight) {
      // using last weights if weightsID is not found
      selectWeight = weights[weights.length - 1];
    }

    // get table name from geodaState
    if (!tableName) {
      return {result: 'Error: table name is empty'};
    }
    if (!checkIfFieldNameExists(tableName, variableName, visState)) {
      return {
        result: `${CHAT_FIELD_NAME_NOT_FOUND} For example, run local moran analysis using variable HR60 and KNN weights with k=4.`
      };
    }
    // get column data
    const columnData = await getColumnDataFromKeplerLayer(
      tableName,
      variableName,
      visState.datasets
    );
    if (!columnData || columnData.length === 0) {
      return {result: 'Error: column data is empty'};
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
  },

  histogram: function ({k, variableName}, {dataContainer}): HistogramOutput | ErrorOutput {
    // get column data
    const columnData = getColumnData(variableName, dataContainer);

    // check column data is empty
    if (!columnData || columnData.length === 0) {
      return {type: 'histogram', result: `${CHAT_COLUMN_DATA_NOT_FOUND}`};
    }

    // call histogram function
    const hist = createHistogram(columnData, k);

    // remove key items from hist
    const histogram = hist.map((h: HistogramDataProps) => {
      // @ts-ignore
      const {items, ...rest} = h;
      return rest;
    });

    return {
      type: 'histogram',
      name: 'Histogram',
      result: {
        id: Math.random().toString(36).substring(7),
        variableName,
        numberOfBins: k,
        histogram
      },
      data: hist
    };
  }
};
