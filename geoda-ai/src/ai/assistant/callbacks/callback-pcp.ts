import {CreateParallelCoordinateProps} from '@/utils/plots/parallel-coordinate-utils';

import {createErrorResult} from '../custom-functions';
import {findKeplerDatasetByVariableName, getColumnDataFromKeplerDataset} from '@/utils/data-utils';
import {CHAT_COLUMN_DATA_NOT_FOUND, CHAT_NOT_ENOUGH_COLUMNS} from '@/constants';
import {generateRandomId} from '@/utils/ui-utils';
import {VisState} from '@kepler.gl/schemas';
import {
  CallbackFunctionProps,
  CustomFunctionContext,
  CustomFunctionOutputProps,
  ErrorCallbackResult,
  RegisterFunctionCallingProps
} from 'react-ai-assist';
import {customPCPMessageCallback} from '@/components/chatgpt/custom-parallel-coordinate-message';

export const createPCPFunctionDefinition = (
  context: CustomFunctionContext<VisState>
): RegisterFunctionCallingProps => ({
  name: 'parallelCoordinate',
  description:
    'Create a parallel coordinate plot(otherwise known as a pcp) to visually identify clusters and patterns in a multi-dimensional variable space. In a PCP, each variable is represented as a (parallel) axis, and each observation consists of a line that connects points on the axes. Clusters are identified as groups of lines (i.e., observations) that follow a similar path.',
  properties: {
    variableNames: {
      type: 'array',
      items: {
        type: 'string'
      },
      description: 'A list of the variable names'
    },
    datasetName: {
      type: 'string',
      description:
        'The name of the dataset. If not provided, please try to find the dataset name that contains the variableNames.'
    }
  },
  required: ['variableNames', 'datasetName'],
  callbackFunction: parallelCoordinateCallback,
  callbackFunctionContext: context,
  callbackMessage: customPCPMessageCallback
});

export type ParallelCoordinateCallbackResult = {
  id: string;
  datasetId: string;
  datasetName: string;
  variables: string[];
  variableX?: string;
  variableY?: string;
};

export type ParallelCoordinateCallbackData = unknown;

export type ParallelCoordinateCallbackOutput = CustomFunctionOutputProps<
  ParallelCoordinateCallbackResult | ErrorCallbackResult,
  ParallelCoordinateCallbackData
>;

type ParallelCoordinateCallbackProps = {
  variableNames?: string[];
  variableName?: string;
  variableX?: string;
  variableY?: string;
  datasetName?: string;
};

export function parallelCoordinateCallback({
  functionName,
  functionArgs,
  functionContext
}: CallbackFunctionProps): ParallelCoordinateCallbackOutput {
  const {
    variableNames: inputVarNames,
    variableName: inputVariableName,
    variableX: inputVariableX,
    variableY: inputVariableY,
    datasetName
  } = functionArgs as ParallelCoordinateCallbackProps;
  const {visState} = functionContext as {visState: VisState};

  let variableNames = inputVarNames || [];
  if (typeof inputVarNames === 'string') {
    try {
      variableNames = JSON.parse(inputVarNames);
    } catch (e) {
      return createErrorResult({name: functionName, result: CHAT_COLUMN_DATA_NOT_FOUND});
    }
  }

  if (inputVariableX) {
    variableNames.push(inputVariableX);
  }
  if (inputVariableY) {
    variableNames.push(inputVariableY);
  }
  if (inputVariableName) {
    variableNames.push(inputVariableName);
  }

  // get dataset using dataset name from visState
  const keplerDataset = findKeplerDatasetByVariableName(
    datasetName,
    variableNames[0],
    visState.datasets
  );
  if (!keplerDataset) {
    return createErrorResult({name: functionName, result: CHAT_COLUMN_DATA_NOT_FOUND});
  }

  // get data from variable
  const data: CreateParallelCoordinateProps['data'] = variableNames.reduce(
    (prev: CreateParallelCoordinateProps['data'], cur: string) => {
      const values = getColumnDataFromKeplerDataset(cur, keplerDataset);
      prev[cur] = values;
      return prev;
    },
    {}
  );

  // check column data is empty
  if (!data || Object.keys(data).length === 0) {
    return createErrorResult({name: functionName, result: CHAT_COLUMN_DATA_NOT_FOUND});
  }

  // check if there are at least 2 columns
  if (Object.keys(data).length === 1) {
    return createErrorResult({name: functionName, result: CHAT_NOT_ENOUGH_COLUMNS});
  }

  return {
    type: 'parallel-coordinate',
    name: 'Parallel Coordinate Plot',
    result: {
      id: generateRandomId(),
      datasetId: keplerDataset.id,
      datasetName: keplerDataset.label,
      variables: variableNames
    }
  };
}
