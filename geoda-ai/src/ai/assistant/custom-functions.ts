// define a type of custom function that is an object contains key-value pairs

import {spatialRegressionCallback} from './callbacks/callback-regression';
import {createVariableCallBack} from './callbacks/callback-table';
import {createWeightsCallback} from './callbacks/callback-weights';
import {createMapCallback} from './callbacks/callback-map';
import {boxplotCallback} from './callbacks/callback-box';
import {parallelCoordinateCallback} from './callbacks/callback-pcp';
import {bubbleCallback} from './callbacks/callback-bubble';
import {scatterCallback} from './callbacks/callback-scatter';
import {histogramCallback} from './callbacks/callback-histogram';
import {lisaCallback} from './callbacks/callback-lisa';
import {CustomFunctionOutputProps, CustomFunctions} from '../types';

export type ErrorOutput = CustomFunctionOutputProps<unknown, unknown> & {
  type: 'error';
  name: string;
  result: {
    success: boolean;
    details: string;
  };
};

/**
 * Helper function to create an error result for custom functions
 * @param {name} name The name of the callback function
 * @param {result} result The error message
 * @returns {ErrorOutput} The error output object which is a type of CustomFunctionOutputProps. It will be returned to LLM and displayed as an error message.
 */
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
  spatialRegression: spatialRegressionCallback,
  createVariable: createVariableCallBack,
  createWeights: createWeightsCallback,
  createMap: createMapCallback,
  lisa: lisaCallback
};
