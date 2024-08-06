// define a type of custom function that is an object contains key-value pairs

import {CustomFunctions} from '../openai-utils';
import {spatialRegressionCallbackFunc} from './callbacks/callback-regression';
import {createVariableCallBack} from './callbacks/callback-table';
import {createWeightsCallback} from './callbacks/callback-weights';
import {createMapCallback} from './callbacks/callback-map';
import {boxplotCallback} from './callbacks/callback-box';
import {parallelCoordinateCallback} from './callbacks/callback-pcp';
import {bubbleCallback} from './callbacks/callback-bubble';
import {scatterCallback} from './callbacks/callback-scatter';
import {histogramCallback} from './callbacks/callback-histogram';
import {univariateLocalMoranCallback} from './callbacks/callback-localmoran';

export type CustomFunctionArgs = {
  functionName: string;
  functionArgs: Record<string, any>;
  context: any;
};

// define enum for custom function names, the value of each enum is
// the name of the function that is defined in OpenAI assistant model
export enum CustomFunctionNames {
  HISTOGRAM = 'histogram',
  SCATTERPLOT = 'scatter',
  BUBBLE_CHART = 'bubble',
  BOXPLOT = 'boxplot',
  PARALLELCOORDINATE = 'parallelCoordinate',
  SPATIAL_REGRESSION = 'spatialRegression',
  CREATE_VARIABLE = 'createVariable',
  CREATE_WEIGHTS = 'createWeights',
  CREATE_MAP = 'createMap',
  LOCAL_MORAN = 'univariateLocalMoran'
}

export type ErrorOutput = {
  type: 'error';
  name: string;
  result: {
    success: boolean;
    details: string;
  };
};

export function createErrorResult({name, result}: {name: string; result: string}): ErrorOutput {
  return {
    type: 'error',
    name,
    result: {
      success: false,
      details: result
    }
  };
}

export const CUSTOM_FUNCTIONS: CustomFunctions = {
  histogram: histogramCallback,
  scatter: scatterCallback,
  bubble: bubbleCallback,
  boxplot: boxplotCallback,
  parallelCoordinate: parallelCoordinateCallback,
  spatialRegression: spatialRegressionCallbackFunc,
  createVariable: createVariableCallBack,
  createWeights: createWeightsCallback,
  createMap: createMapCallback,
  univariateLocalMoran: univariateLocalMoranCallback
};
