// define a type of custom function that is an object contains key-value pairs

import {getColumnData, getTableNameSync} from '@/hooks/use-duckdb';
import {quantileBreaks, naturalBreaks} from 'geoda-wasm';

// define enum for custom function names
export enum CustomFunctionNames {
  SUMMARIZE_DATA = 'summarizeData',
  QUANTILE_BREAKS = 'quantileBreaks',
  NATURAL_BREAKS = 'naturalBreaks'
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

export const CUSTOM_FUNCTIONS: CustomFunctions = {
  summarizeData: function ({tableName}: SummarizeDataProps) {
    // dispatch summarize data action
    console.log('calling summarizeData() with arguments:', tableName);
    const result = getTableNameSync();
    return {tableName, result};
  },

  quantileBreaks: async function ({k, variableName}: CustomMapBreaksProps) {
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
  }

};
