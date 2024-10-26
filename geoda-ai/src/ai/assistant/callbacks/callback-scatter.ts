import {generateRandomId} from '@/utils/ui-utils';
import {createErrorResult} from '../custom-functions';
import {findKeplerDatasetByVariableName, getColumnDataFromKeplerDataset} from '@/utils/data-utils';
import {CHAT_COLUMN_DATA_NOT_FOUND} from '@/constants';
import {
  CallbackFunctionProps,
  CustomFunctionContext,
  CustomFunctionOutputProps,
  ErrorCallbackResult,
  RegisterFunctionCallingProps
} from 'soft-ai';
import {VisState} from '@kepler.gl/schemas';
import {customScatterPlotMessageCallback} from '@/components/chatgpt/custom-scatter-message';

export const createScatterPlotFunctionDefinition = (
  context: CustomFunctionContext<VisState>
): RegisterFunctionCallingProps => ({
  name: 'scatter',
  description:
    'Generate a scatterplot to visualize the relationship between two numerical variables.',
  properties: {
    variableX: {
      type: 'string',
      description:
        'The name of the variable to be plotted along the X-axis, representing the independent variable.'
    },
    variableY: {
      type: 'string',
      description:
        'The name of the variable to be plotted along the Y-axis, representing the dependent variable or the variable of interest.'
    },
    datasetName: {
      type: 'string',
      description:
        'The name of the dataset. If not provided, please try to find the dataset name that contains the variableX and variableY.'
    }
  },
  required: ['variableX', 'variableY', 'datasetName'],
  callbackFunction: scatterCallback,
  callbackFunctionContext: context,
  callbackMessage: customScatterPlotMessageCallback
});

export type ScatterCallbackResult = {
  id: string;
  datasetId: string;
  datasetName: string;
  variableX: string;
  variableY: string;
};

// data is not needed for classic scatter plot, but when linear regression is added, it will be used
export type ScatterCallbackData = unknown;

export type ScatterCallbackOutput = CustomFunctionOutputProps<
  ScatterCallbackResult | ErrorCallbackResult,
  ScatterCallbackData
>;

export type ScatterCallbackProps = {
  variableX: string;
  variableY: string;
  datasetName?: string;
};

export function scatterCallback({
  functionName,
  functionArgs,
  functionContext
}: CallbackFunctionProps): ScatterCallbackOutput {
  const {variableX, variableY, datasetName} = functionArgs as ScatterCallbackResult;
  const {visState} = functionContext as {visState: VisState};

  // get dataset using dataset name from visState
  const keplerDataset = findKeplerDatasetByVariableName(datasetName, variableX, visState.datasets);
  if (!keplerDataset) {
    return createErrorResult({name: functionName, result: CHAT_COLUMN_DATA_NOT_FOUND});
  }

  const columnDataX = getColumnDataFromKeplerDataset(variableX, keplerDataset);
  const columnDataY = getColumnDataFromKeplerDataset(variableY, keplerDataset);

  // Check if both variables' data are successfully accessed
  if (!columnDataX || columnDataX.length === 0 || !columnDataY || columnDataY.length === 0) {
    return createErrorResult({name: functionName, result: CHAT_COLUMN_DATA_NOT_FOUND});
  }

  return {
    type: 'scatter',
    name: 'Scatter plot',
    result: {
      id: generateRandomId(),
      datasetId: keplerDataset.id,
      datasetName: keplerDataset.label,
      variableX,
      variableY
    }
  };
}
