import {findKeplerDatasetByVariableName, getColumnDataFromKeplerDataset} from '@/utils/data-utils';
import {createErrorResult} from '../custom-functions';
import {CHAT_COLUMN_DATA_NOT_FOUND} from '@/constants';
import {generateRandomId} from '@/utils/ui-utils';
import {VisState} from '@kepler.gl/schemas';
import {
  CallbackFunctionProps,
  CustomFunctionContext,
  CustomFunctionOutputProps,
  ErrorCallbackResult,
  RegisterFunctionCallingProps
} from 'react-ai-assist';
import {customBubbleChartMessageCallback} from '@/components/chatgpt/custom-bubblechart-message';

export const createBubbleChartFunctionDefinition = (
  context: CustomFunctionContext<VisState>
): RegisterFunctionCallingProps => ({
  name: 'bubble',
  description:
    'Generate a bubble chart to visualize the relationship between two numerical variables with the additional dimension of size, representing a third variable. Each point on the plot corresponds to an observation in the dataset, with the position along the X and Y axes representing the values of the two variables, and the size of each bubble representing the magnitude of the third variable. Optionally, bubbles can also be colored based on another categorical or numerical variable.',
  properties: {
    variableX: {
      type: 'string',
      description:
        'The name of the variable to be plotted along the X-axis, often representing the independent variable.'
    },
    variableY: {
      type: 'string',
      description:
        'The name of the variable to be plotted along the Y-axis, often representing the dependent variable or the variable of interest.'
    },
    variableSize: {
      type: 'string',
      description:
        'The name of the variable to be represented by the size of each bubble, adding a third dimensional analysis to the data visualization.'
    },
    variableColor: {
      type: 'string',
      description:
        'Optionally, the name of the variable to be represented by the color of each bubble, possibly to categorize or further differentiate the data points.'
    },
    datasetName: {
      type: 'string',
      description:
        'The name of the dataset. If not provided, please try to find the dataset name that contains the variableX, variableY, variableSize and variableColor.'
    }
  },
  required: ['variableX', 'variableY', 'variableSize', 'datasetName'],
  callbackFunction: bubbleCallback,
  callbackFunctionContext: context,
  callbackMessage: customBubbleChartMessageCallback
});

export type BubbleChartCallbackResult = {
  id: string;
  datasetId: string;
  datasetName: string;
  variableX: string;
  variableY: string;
  variableSize: string;
  variableColor?: string;
};

export type BubbleChartCallbackData = unknown;

export type BubbleChartCallbackOutput = CustomFunctionOutputProps<
  BubbleChartCallbackResult | ErrorCallbackResult,
  BubbleChartCallbackData
>;

export function isCustomBubbleChartOutput(
  props: CustomFunctionOutputProps<unknown, unknown>
): props is BubbleChartCallbackOutput {
  return props.type === 'bubble';
}

export function isBubbleChartCallbackResult(
  props: BubbleChartCallbackResult | ErrorCallbackResult
): props is BubbleChartCallbackResult {
  return (props as BubbleChartCallbackResult).variableX !== undefined;
}

type BubbleCallbackProps = {
  variableX: string;
  variableY: string;
  variableSize: string;
  variableColor?: string;
  datasetName?: string;
};

export function bubbleCallback({
  functionName,
  functionArgs,
  functionContext
}: CallbackFunctionProps): BubbleChartCallbackOutput {
  const {variableX, variableY, variableSize, variableColor, datasetName} =
    functionArgs as BubbleCallbackProps;
  const {visState} = functionContext as {visState: VisState};

  // get dataset using dataset name from visState
  const keplerDataset = findKeplerDatasetByVariableName(datasetName, variableX, visState.datasets);
  if (!keplerDataset) {
    return createErrorResult({name: functionName, result: CHAT_COLUMN_DATA_NOT_FOUND});
  }

  const columnDataX = getColumnDataFromKeplerDataset(variableX, keplerDataset);
  const columnDataY = getColumnDataFromKeplerDataset(variableY, keplerDataset);
  const columnDataSize = getColumnDataFromKeplerDataset(variableSize, keplerDataset);
  const columnDataColor = variableColor
    ? getColumnDataFromKeplerDataset(variableColor, keplerDataset)
    : undefined;

  // Check if both variables' data are successfully accessed
  if (
    !columnDataX ||
    columnDataX.length === 0 ||
    !columnDataY ||
    columnDataY.length === 0 ||
    !columnDataSize ||
    columnDataSize.length === 0
  ) {
    return createErrorResult({name: functionName, result: CHAT_COLUMN_DATA_NOT_FOUND});
  }

  if (variableColor && (!columnDataColor || columnDataColor.length === 0)) {
    return createErrorResult({name: functionName, result: CHAT_COLUMN_DATA_NOT_FOUND});
  }

  return {
    type: 'bubble',
    name: 'Bubble Chart Data',
    result: {
      id: generateRandomId(),
      datasetId: keplerDataset.id,
      datasetName: keplerDataset.label,
      variableX,
      variableY,
      variableSize,
      variableColor
    }
  };
}
