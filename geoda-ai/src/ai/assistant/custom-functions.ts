// define a type of custom function that is an object contains key-value pairs

import {CustomFunctions} from '../openai-utils';
import {linearRegressionCallbackFunc} from './callbacks/callback-regression';
import {createVariableCallBack} from './callbacks/callback-table';
import {createWeightsCallback} from './callbacks/callback-weights';
import {createMapCallback} from './callbacks/callback-map';
import {boxplotCallback} from './callbacks/callback-box';
import {parallelCoordinateCallback} from './callbacks/callback-pcp';
import {bubbleCallback} from './callbacks/callback-bubble';
import {scatterCallback} from './callbacks/callback-scatter';
import {histogramCallback} from './callbacks/callback-histogram';
import {univariateLocalMoranCallback} from './callbacks/callback-localmoran';

// define enum for custom function names, the value of each enum is
// the name of the function that is defined in OpenAI assistant model
export enum CustomFunctionNames {
  HISTOGRAM = 'histogram',
  SCATTERPLOT = 'scatter',
  BUBBLE_CHART = 'bubble',
  BOXPLOT = 'boxplot',
  PARALLELCOORDINATE = 'parallelCoordinate',
  LINEAR_REGRESSION = 'linearRegression',
  CREATE_VARIABLE = 'createVariable',
  CREATE_WEIGHTS = 'createWeights',
  CREATE_MAP = 'createMap',
  LOCAL_MORAN = 'univariateLocalMoran'
}

export type ErrorOutput = {
  type: 'error';
  result: {
    success: boolean;
    details: string;
  };
};

export function createErrorResult(result: string): ErrorOutput {
  return {
    type: 'error',
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
  linearRegression: linearRegressionCallbackFunc,
  createVariable: createVariableCallBack,
  createWeights: createWeightsCallback,
  createMap: createMapCallback,
  univariateLocalMoran: univariateLocalMoranCallback
};
