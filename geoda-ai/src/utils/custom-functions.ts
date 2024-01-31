// define a type of custom function that is an object contains key-value pairs

import {MAP_ID} from '@/constants';
import {getColumnData, getTableSummary} from '@/hooks/use-duckdb';
import {GeoDaState} from '@/store';
import {
  quantileBreaks,
  naturalBreaks,
  getNearestNeighborsFromBinaryGeometries,
  WeightsMeta,
  getMetaFromWeights
} from 'geoda-wasm';
import {getKeplerLayer} from './data-utils';

// define enum for custom function names
export enum CustomFunctionNames {
  SUMMARIZE_DATA = 'summarizeData',
  QUANTILE_BREAKS = 'quantileBreaks',
  NATURAL_BREAKS = 'naturalBreaks',
  KNN_WEIGHT = 'knnWeight'
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
  }
};
