import {
  checkIfFieldNameExists,
  findKeplerDatasetByVariableName,
  getColumnDataFromKeplerDataset,
  isNumberArray
} from '@/utils/data-utils';
import {createErrorResult} from '../custom-functions';
import {
  CHAT_COLUMN_DATA_NOT_FOUND,
  CHAT_DATASET_NOT_FOUND,
  CHAT_FIELD_NAME_NOT_FOUND,
  MappingTypes
} from '@/constants';
import {createMapBreaks} from '@/utils/mapping-functions';
import {VisState} from '@kepler.gl/schemas';
import {
  CallbackFunctionProps,
  CustomFunctionContext,
  CustomFunctionOutputProps,
  ErrorCallbackResult,
  RegisterFunctionCallingProps
} from '@openassistant/core';
import {customMapMessageCallback} from '@/components/chatgpt/custom-map-message';

export const createMapFunctionDefinition = (
  context: CustomFunctionContext<VisState>
): RegisterFunctionCallingProps => ({
  name: 'createMap',
  description: 'Create a thematic map',
  properties: {
    mapType: {
      type: 'string',
      description:
        'The name of the map type. It should be one of the following types: quantile, natural breaks, equal interval, percentile, box, standard deviation, unique values. The default value is quantile.'
    },
    k: {
      type: 'number',
      description:
        'The number of bins or classes that the numeric values will be groupped into. The default value of k is 5.'
    },
    variableName: {
      type: 'string',
      description: 'The variable name.'
    },
    hinge: {
      type: 'number',
      description:
        'This property is only for box map. This numeric value defines the lower and upper edges of the box known as hinges. It could be either 1.5 or 3.0, and the default value is 1.5'
    },
    datasetName: {
      type: 'string',
      description:
        'The name of the dataset. If not provided, please try to find the dataset name that contains the variableName.'
    }
  },
  required: ['mapType', 'variableName', 'datasetName'],
  callbackFunction: createMapCallback,
  callbackFunctionContext: context,
  callbackMessage: customMapMessageCallback
});

export type MapCallbackResult = {
  datasetId: string;
  classificationMethod: string;
  classificationValues: Array<number | string>;
};

export type MapCallbackOutput = CustomFunctionOutputProps<
  MapCallbackResult | ErrorCallbackResult,
  unknown
>;

type CreateMapCallbackProps = {
  mapType:
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

export async function createMapCallback({
  functionName,
  functionArgs,
  functionContext
}: CallbackFunctionProps): Promise<MapCallbackOutput> {
  const {
    mapType,
    variableName,
    k: inputK,
    hinge: inputHinge,
    datasetName
  } = functionArgs as CreateMapCallbackProps;
  const {visState} = functionContext as {visState: VisState};

  // convert inputK to number if it is not
  let k = inputK || 5;
  if (typeof inputK === 'string') {
    k = parseInt(inputK, 10);
  }

  // convert inputHinge to number if it is not
  let hinge = inputHinge || 1.5;
  if (typeof inputHinge === 'string') {
    hinge = parseFloat(inputHinge);
  }

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
  if (mapType === 'unique values') {
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
        result: {datasetId, classificationMethod: mapType, classificationValues}
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
  if (['quantile', 'natural breaks', 'equal interval'].includes(mapType)) {
    if (!k || k < 2) {
      return createErrorResult({
        name: functionName,
        result: `Error: k value should be greater than 1 for ${mapType} map.`
      });
    }
    if (mapType === 'quantile') {
      classificationValues = await createMapBreaks({
        mappingType: MappingTypes.QUANTILE,
        k,
        values: columnData
      });
    } else if (mapType === 'natural breaks') {
      classificationValues = await createMapBreaks({
        mappingType: MappingTypes.NATURAL_BREAK,
        k,
        values: columnData
      });
    } else if (mapType === 'equal interval') {
      classificationValues = await createMapBreaks({
        mappingType: MappingTypes.EQUAL_INTERVAL,
        k,
        values: columnData
      });
    }
  }
  // no need the value of k
  if (mapType === 'percentile') {
    classificationValues = await createMapBreaks({
      mappingType: MappingTypes.PERCENTILE,
      values: columnData
    });
  } else if (mapType === 'box') {
    classificationValues = await createMapBreaks({
      mappingType: hinge === 1.5 ? MappingTypes.BOX_MAP_15 : MappingTypes.BOX_MAP_30,
      values: columnData
    });
  } else if (mapType === 'standard deviation') {
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
        classificationMethod: mapType,
        datasetId
      }
    };
  }

  return createErrorResult({
    name: functionName,
    result: 'Error: classification method for map creation is not supported'
  });
}
