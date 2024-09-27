// define a type of custom function that is an object contains key-value pairs
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
export function createErrorResult({name, result}: {name: string; result: string}) {
  return {
    type: 'error',
    name,
    result: {
      success: false,
      details: result
    }
  };
}

export const CUSTOM_FUNCTIONS: CustomFunctions = {};
