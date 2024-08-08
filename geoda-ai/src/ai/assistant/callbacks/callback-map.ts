import {
  checkIfFieldNameExists,
  findKeplerDatasetByVariableName,
  getColumnDataFromKeplerDataset,
  isNumberArray
} from '@/utils/data-utils';
import {createErrorResult, ErrorOutput} from '../custom-functions';
import {
  CHAT_COLUMN_DATA_NOT_FOUND,
  CHAT_DATASET_NOT_FOUND,
  CHAT_FIELD_NAME_NOT_FOUND,
  MappingTypes
} from '@/constants';
import {createMapBreaks} from '@/utils/mapping-functions';
import {VisState} from '@kepler.gl/schemas';
import {CustomFunctionOutputProps} from '@/ai/types';

// LLM will return functionName and functionArgs
// CustomFunctions {functionName: callbackFunction}
// CustomFunctionContext e.g. visState
// CustomFunctionOutput, includes `result` for LLM  and `data` for custom UI

type MapResult = {
  datasetId: string;
  classificationMethod: string;
  classificationValues: Array<number | string>;
};

export type MapCallbackOutput = CustomFunctionOutputProps<MapResult, unknown> & {
  type: 'mapping';
};

type CreateMapCallbackProps = {
  method:
    | 'quantile'
    | 'natural breaks'
    | 'equal interval'
    | 'percentile'
    | 'box'
    | 'standard deviation'
    | 'unique values';
  variableName: string;
  k?: number;
  hinge?: number;
  datasetName?: string;
};

export async function createMapCallback(
  functionName: string,
  {method, variableName, k = 5, hinge, datasetName}: CreateMapCallbackProps,
  {visState}: {visState: VisState}
): Promise<MapCallbackOutput | ErrorOutput> {
  // get dataset using dataset name from visState
  const keplerDataset = findKeplerDatasetByVariableName(
    datasetName,
    variableName,
    visState.datasets
  );
  if (!keplerDataset) {
    return createErrorResult({name: functionName, result: CHAT_DATASET_NOT_FOUND});
  }

  if (!checkIfFieldNameExists(keplerDataset.label, variableName, visState)) {
    return createErrorResult({
      name: functionName,
      result: `${CHAT_FIELD_NAME_NOT_FOUND} For example, create a quantile map using variable HR60 and 5 quantiles.`
    });
  }

  const datasetId = keplerDataset.id;
  const columnData = getColumnDataFromKeplerDataset(variableName, keplerDataset);
  if (!columnData || columnData.length === 0) {
    return createErrorResult({name: functionName, result: CHAT_COLUMN_DATA_NOT_FOUND});
  }

  let classificationValues: Array<number | string> | null = null;

  // special case for unique values
  if (method === 'unique values') {
    const uniqueValues = Array.from(new Set(columnData));
    classificationValues = uniqueValues;
    // check if the number of unique values is more than 100
    if (uniqueValues.length > 100) {
      return createErrorResult({
        name: functionName,
        result:
          'Error: unique values are more than 100. Please use another method for map creation.'
      });
    }
    // return the result
    if (classificationValues) {
      return {
        type: 'mapping',
        name: functionName,
        result: {datasetId, classificationMethod: method, classificationValues}
      };
    }
  }

  // for all other map classification methods, column data should be numeric
  if (!isNumberArray(columnData)) {
    return createErrorResult({
      name: functionName,
      result: 'Error: column data should be numeric for map creation.'
    });
  }

  // need the value of k
  if (['quantile', 'natural breaks', 'equal interval'].includes(method)) {
    if (!k || k < 2) {
      return createErrorResult({
        name: functionName,
        result: `Error: k value should be greater than 1 for ${method} map.`
      });
    }
    if (method === 'quantile') {
      classificationValues = await createMapBreaks({
        mappingType: MappingTypes.QUANTILE,
        k,
        values: columnData
      });
    } else if (method === 'natural breaks') {
      classificationValues = await createMapBreaks({
        mappingType: MappingTypes.NATURAL_BREAK,
        k,
        values: columnData
      });
    } else if (method === 'equal interval') {
      classificationValues = await createMapBreaks({
        mappingType: MappingTypes.EQUAL_INTERVAL,
        k,
        values: columnData
      });
    }
  }
  // no need the value of k
  if (method === 'percentile') {
    classificationValues = await createMapBreaks({
      mappingType: MappingTypes.PERCENTILE,
      values: columnData
    });
  } else if (method === 'box') {
    classificationValues = await createMapBreaks({
      mappingType: hinge === 1.5 ? MappingTypes.BOX_MAP_15 : MappingTypes.BOX_MAP_30,
      values: columnData
    });
  } else if (method === 'standard deviation') {
    classificationValues = await createMapBreaks({
      mappingType: MappingTypes.STD_MAP,
      values: columnData
    });
  }

  // return the result
  if (classificationValues) {
    return {
      type: 'mapping',
      name: functionName,
      result: {
        classificationValues,
        classificationMethod: method,
        datasetId
      }
    };
  }

  return createErrorResult({
    name: functionName,
    result: 'Error: classification method for map creation is not supported'
  });
}
