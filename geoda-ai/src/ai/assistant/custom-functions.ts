// define a type of custom function that is an object contains key-value pairs

import {getTableSummary} from '@/hooks/use-duckdb';

import {CustomFunctions} from '../openai-utils';
import {linearRegressionCallbackFunc} from './callbacks/callback-regression';
import {createVariableCallBack} from './callbacks/callback-table';
import {createWeightsCallback} from './callbacks/callback-weights';
import {createMapCallback} from './callbacks/callback-map';
import {getMetaDataCallback} from './callbacks/callback-metadata';
import {boxplotCallback} from './callbacks/callback-box';
import {parallelCoordinateCallback} from './callbacks/callback-pcp';
import {bubbleCallback} from './callbacks/callback-bubble';
import {scatterCallback} from './callbacks/callback-scatter';
import {histogramCallback} from './callbacks/callback-histogram';
import {univariateLocalMoranCallback} from './callbacks/callback-localmoran';

// define enum for custom function names, the value of each enum is
// the name of the function that is defined in OpenAI assistant model
export enum CustomFunctionNames {
  SUMMARIZE_DATA = 'summarizeData',
  LOCAL_MORAN = 'univariateLocalMoran',
  HISTOGRAM = 'histogram',
  BOXPLOT = 'boxplot',
  BUBBLE_CHART = 'bubble',
  SCATTERPLOT = 'scatter',
  CREATE_WEIGHTS = 'createWeights',
  CREATE_MAP = 'createMap',
  META_DATA = 'metaData'
}

export type ErrorOutput = {
  result: {
    success: boolean;
    details: string;
  };
};

export function createErrorResult(result: string): ErrorOutput {
  return {
    result: {
      success: false,
      details: result
    }
  };
}

export const CUSTOM_FUNCTIONS: CustomFunctions = {
  summarizeData: async function ({tableName}) {
    // dispatch summarize data action
    const result = await getTableSummary();
    return {tableName, result};
  },
  univariateLocalMoran: univariateLocalMoranCallback,
  histogram: histogramCallback,
  scatter: scatterCallback,
  bubble: bubbleCallback,
  boxplot: boxplotCallback,
  parallelCoordinate: parallelCoordinateCallback,
  linearRegression: linearRegressionCallbackFunc,
  createVariable: createVariableCallBack,
  createWeights: createWeightsCallback,
  createMap: createMapCallback,
  metaData: getMetaDataCallback
};
