import {checkIfFieldNameExists, getColumnDataFromKeplerLayer} from '@/utils/data-utils';
import {createErrorResult, CustomFunctionContext, ErrorOutput} from '../custom-functions';
import {CHAT_COLUMN_DATA_NOT_FOUND, CHAT_FIELD_NAME_NOT_FOUND, MappingTypes} from '@/constants';
import {createMapBreaks} from '@/utils/mapping-functions';

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
};

type MapCallbackOutput = {
  type: 'mapping';
  name: string;
  result: number[];
};

export async function createMapCallback(
  {method, variableName, k = 5, hinge}: CreateMapCallbackProps,
  {tableName, visState}: CustomFunctionContext
): Promise<MapCallbackOutput | ErrorOutput> {
  if (!checkIfFieldNameExists(tableName, variableName, visState)) {
    return createErrorResult(
      `${CHAT_FIELD_NAME_NOT_FOUND} For example, create a quantile map using variable HR60 and 5 quantiles.`
    );
  }
  const columnData = getColumnDataFromKeplerLayer(tableName, variableName, visState.datasets);
  if (!columnData || columnData.length === 0) {
    return createErrorResult(CHAT_COLUMN_DATA_NOT_FOUND);
  }

  let result: number[] | null = null;

  // need the value of k
  if (['quantile', 'natural breaks', 'equal interval'].includes(method)) {
    if (!k || k < 2) {
      return createErrorResult(`Error: k value should be greater than 1 for ${method} map.`);
    } else {
      if (method === 'quantile') {
        result = await createMapBreaks({mappingType: MappingTypes.QUANTILE, k, values: columnData});
      } else if (method === 'natural breaks') {
        result = await createMapBreaks({
          mappingType: MappingTypes.NATURAL_BREAK,
          k,
          values: columnData
        });
      } else if (method === 'equal interval') {
        result = await createMapBreaks({
          mappingType: MappingTypes.EQUAL_INTERVAL,
          k,
          values: columnData
        });
      }
    }
  }
  // no need the value of k
  if (method === 'percentile') {
    result = await createMapBreaks({
      mappingType: MappingTypes.PERCENTILE,
      values: columnData
    });
  } else if (method === 'box') {
    result = await createMapBreaks({
      mappingType: hinge === 1.5 ? MappingTypes.BOX_MAP_15 : MappingTypes.BOX_MAP_30,
      values: columnData
    });
  } else if (method === 'standard deviation') {
    result = await createMapBreaks({
      mappingType: MappingTypes.STD_MAP,
      values: columnData
    });
  } else if (method === 'unique values') {
    const uniqueValues = Array.from(new Set(columnData));
    result = uniqueValues;
  }

  // return the result
  if (result) {
    return {type: 'mapping', name: method, result};
  }

  return createErrorResult('Error: classification method for map creation is not supported');
}
