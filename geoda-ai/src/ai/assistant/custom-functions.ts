// define a type of custom function that is an object contains key-value pairs

import {quantileBreaks, naturalBreaks, WeightsMeta, localMoran} from 'geoda-wasm';
import {DataContainerInterface} from '@kepler.gl/utils';

import {getTableSummary} from '@/hooks/use-duckdb';
import {
  checkIfFieldNameExists,
  getColumnDataFromKeplerLayer,
  getColumnData
} from '@/utils/data-utils';
import {
  CHAT_FIELD_NAME_NOT_FOUND,
  CHAT_COLUMN_DATA_NOT_FOUND,
  CHAT_WEIGHTS_NOT_FOUND,
  CHAT_NOT_ENOUGH_COLUMNS
} from '@/constants';
import {WeightsProps} from '@/actions';
import {HistogramDataProps, createHistogram} from '@/utils/plots/histogram-utils';
import {BoxplotDataProps, CreateBoxplotProps, createBoxplot} from '@/utils/plots/boxplot-utils';
import {CreateParallelCoordinateProps} from '@/utils/plots/parallel-coordinate-utils';
import {generateRandomId} from '@/utils/ui-utils';

import {CustomFunctions} from '../openai-utils';
import {linearRegressionCallbackFunc} from './callbacks/callback-regression';
import {createVariableCallBack} from './callbacks/callback-table';
import {createWeightsCallback} from './callbacks/callback-weights';

// define enum for custom function names, the value of each enum is
// the name of the function that is defined in OpenAI assistant model
export enum CustomFunctionNames {
  SUMMARIZE_DATA = 'summarizeData',
  QUANTILE_BREAKS = 'quantileBreaks',
  NATURAL_BREAKS = 'naturalBreaks',
  KNN_WEIGHT = 'knnWeight',
  LOCAL_MORAN = 'univariateLocalMoran',
  HISTOGRAM = 'histogram',
  BOXPLOT = 'boxplot',
  CONTIGUITY_WEIGHT = 'contiguityWeight',
  BUBBLE_CHART = 'bubble',
  SCATTERPLOT = 'scatter',
  CREATE_WEIGHTS = 'createWeights'
}

export function createErrorResult(result: string): ErrorOutput {
  return {
    result: {
      success: false,
      details: result
    }
  };
}

export type CustomFunctionContext = {
  tableName: string;
  visState: any;
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
  result: {
    success: boolean;
    details: string;
  };
};

export type WeightsOutput = {
  type: 'weights';
  name: string;
  result: WeightsMeta;
  data: number[][];
};

export type NaturalBreaksOutput = {
  type: 'mapping';
  name: string;
  result: {
    breaks: number[];
    k: number;
    type: string;
  };
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

export type ScatterplotOutput = {
  type: 'scatter';
  name: string;
  result: {
    variableX: string;
    variableY: string;
  };
};

export type BubbleChartOutput = {
  type: 'bubble';
  name: string;
  result: {
    variableX: string;
    variableY: string;
    variableSize: string;
    variableColor?: string;
  };
};

export const CUSTOM_FUNCTIONS: CustomFunctions = {
  summarizeData: async function ({tableName}: SummarizeDataProps) {
    // dispatch summarize data action
    const result = await getTableSummary();
    return {tableName, result};
  },

  quantileBreaks: async function (
    {k, variableName}: CustomMapBreaksProps,
    {tableName, visState}
  ): Promise<MappingOutput | ErrorOutput> {
    if (!checkIfFieldNameExists(tableName, variableName, visState)) {
      return createErrorResult(
        `${CHAT_FIELD_NAME_NOT_FOUND} For example, create a quantile map using variable HR60 and 5 quantiles.`
      );
    }
    const columnData = getColumnDataFromKeplerLayer(tableName, variableName, visState.datasets);
    if (!columnData || columnData.length === 0) {
      return createErrorResult(CHAT_COLUMN_DATA_NOT_FOUND);
    }
    const result = await quantileBreaks(k, columnData);

    return {type: 'mapping', name: 'Quantile Breaks', result};
  },

  naturalBreaks: async function (
    {k, variableName}: CustomMapBreaksProps,
    {tableName, visState}
  ): Promise<NaturalBreaksOutput | ErrorOutput> {
    if (!checkIfFieldNameExists(tableName, variableName, visState)) {
      return createErrorResult(
        `${CHAT_FIELD_NAME_NOT_FOUND} For example, create a jenks map using variable HR60 and 5 breaks.`
      );
    }
    const columnData = getColumnDataFromKeplerLayer(tableName, variableName, visState.datasets);
    if (!columnData || columnData.length === 0) {
      return createErrorResult(CHAT_COLUMN_DATA_NOT_FOUND);
    }
    const breaks = await naturalBreaks(k, columnData);

    const result = {
      k,
      breaks,
      type: 'natural breaks map'
    };

    return {type: 'mapping', name: 'Natural Breaks', result};
  },

  univariateLocalMoran: async function (
    {variableName, weightsID, permutations = 999, significanceThreshold = 0.05},
    {tableName, visState, weights}
  ): Promise<UniLocalMoranOutput | ErrorOutput> {
    // get weights using weightsID
    let selectWeight = weights.find((w: WeightsProps) => w.weightsMeta.id === weightsID);
    if (weights.length === 0) {
      return createErrorResult(CHAT_WEIGHTS_NOT_FOUND);
    }
    if (!selectWeight) {
      // using last weights if weightsID is not found
      selectWeight = weights[weights.length - 1];
    }

    // get table name from geodaState
    if (!tableName) {
      return createErrorResult('Error: table name is empty');
    }
    if (!checkIfFieldNameExists(tableName, variableName, visState)) {
      return createErrorResult(
        `${CHAT_FIELD_NAME_NOT_FOUND} For example, run local moran analysis using variable HR60 and KNN weights with k=4.`
      );
    }
    // get column data
    const columnData = await getColumnDataFromKeplerLayer(
      tableName,
      variableName,
      visState.datasets
    );
    if (!columnData || columnData.length === 0) {
      return createErrorResult('Error: column data is empty');
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
      return createErrorResult(CHAT_COLUMN_DATA_NOT_FOUND);
    }

    // call histogram function
    const histogram = createHistogram(columnData, k);

    return {
      type: 'histogram',
      name: 'Histogram',
      result: {
        id: generateRandomId(),
        variableName,
        numberOfBins: k,
        histogram
      },
      data: histogram
    };
  },

  scatter: function ({variableX, variableY}, {dataContainer}): ScatterplotOutput | ErrorOutput {
    const columnDataX = getColumnData(variableX, dataContainer);
    const columnDataY = getColumnData(variableY, dataContainer);

    // Check if both variables' data are successfully accessed
    if (!columnDataX || columnDataX.length === 0 || !columnDataY || columnDataY.length === 0) {
      return createErrorResult(CHAT_COLUMN_DATA_NOT_FOUND);
    }

    try {
      return {
        type: 'scatter',
        name: 'Scatterplot Data',
        result: {
          variableX,
          variableY
        }
      };
    } catch (error: any) {
      // if xData and yData arrays lengths do not match
      return {result: error.message};
    }
  },

  bubble: function (
    {variableX, variableY, variableSize, variableColor},
    {dataContainer}
  ): BubbleChartOutput | ErrorOutput {
    const columnDataX = getColumnData(variableX, dataContainer);
    const columnDataY = getColumnData(variableY, dataContainer);
    const columnDataSize = getColumnData(variableSize, dataContainer);
    const columnDataColor = variableColor ? getColumnData(variableColor, dataContainer) : undefined;

    // Check if both variables' data are successfully accessed
    if (
      !columnDataX ||
      columnDataX.length === 0 ||
      !columnDataY ||
      columnDataY.length === 0 ||
      !columnDataSize ||
      columnDataSize.length === 0
    ) {
      return createErrorResult(CHAT_COLUMN_DATA_NOT_FOUND);
    }

    if (variableColor && (!columnDataColor || columnDataColor.length === 0)) {
      return createErrorResult(CHAT_COLUMN_DATA_NOT_FOUND);
    }

    return {
      type: 'bubble',
      name: 'Bubble Chart Data',
      result: {
        variableX,
        variableY,
        variableSize,
        variableColor
      }
    };
  },

  boxplot: boxplotFunction,
  parallelCoordinate: parallelCoordinateFunction,
  linearRegression: linearRegressionCallbackFunc,
  createVariable: createVariableCallBack,
  createWeights: createWeightsCallback
};

export type BoxplotOutput = {
  type: 'boxplot';
  name: string;
  result: {
    id: string;
    variables: string[];
    boundIQR: number;
    boxplot: BoxplotDataProps['boxData'];
  };
  data: BoxplotDataProps;
};

type BoxplotFunctionProps = {
  variableNames: string[];
  boundIQR: number;
};

function boxplotFunction(
  {variableNames, boundIQR}: BoxplotFunctionProps,
  {dataContainer}: {dataContainer: DataContainerInterface}
): BoxplotOutput | ErrorOutput {
  // get data from variable
  const data: CreateBoxplotProps['data'] = variableNames.reduce(
    (prev: CreateBoxplotProps['data'], cur: string) => {
      const values = getColumnData(cur, dataContainer);
      prev[cur] = values;
      return prev;
    },
    {}
  );

  // check column data is empty
  if (!data || Object.keys(data).length === 0) {
    return createErrorResult(CHAT_COLUMN_DATA_NOT_FOUND);
  }

  // call boxplot function
  const boxplot = createBoxplot({data, boundIQR: boundIQR || 1.5});

  return {
    type: 'boxplot',
    name: 'Boxplot',
    result: {
      id: generateRandomId(),
      variables: variableNames,
      boundIQR,
      boxplot: boxplot.boxData
    },
    data: boxplot
  };
}

function parallelCoordinateFunction(
  {variableNames}: {variableNames: string[]},
  {dataContainer}: {dataContainer: DataContainerInterface}
): ParallelCoordinateOutput | ErrorOutput {
  // get data from variable
  const data: CreateParallelCoordinateProps['data'] = variableNames.reduce(
    (prev: CreateParallelCoordinateProps['data'], cur: string) => {
      const values = getColumnData(cur, dataContainer);
      prev[cur] = values;
      return prev;
    },
    {}
  );

  // check column data is empty
  if (!data || Object.keys(data).length === 0) {
    return createErrorResult(CHAT_COLUMN_DATA_NOT_FOUND);
  }

  // check if there are at least 2 columns
  if (Object.keys(data).length === 1) {
    return createErrorResult(CHAT_NOT_ENOUGH_COLUMNS);
  }

  return {
    type: 'parallel-coordinate',
    name: 'ParallelCoordinate',
    result: {
      id: generateRandomId(),
      variables: variableNames
    }
  };
}

export type ParallelCoordinateOutput = {
  type: 'parallel-coordinate';
  name: string;
  result: {
    id: string;
    variables: string[];
  };
};
