import {BoxplotDataProps, CreateBoxplotProps, createBoxplot} from '@/utils/plots/boxplot-utils';
import {createErrorResult} from '../custom-functions';
import {findKeplerDatasetByVariableName, getColumnDataFromKeplerDataset} from '@/utils/data-utils';
import {CHAT_COLUMN_DATA_NOT_FOUND} from '@/constants';
import {generateRandomId} from '@/utils/ui-utils';
import {
  CustomFunctionContext,
  CallbackFunctionProps,
  RegisterFunctionCallingProps,
  CustomFunctionOutputProps,
  ErrorCallbackResult
} from 'soft-ai';
import {VisState} from '@kepler.gl/schemas';
import {customBoxPlotMessageCallback} from '@/components/chatgpt/custom-boxplot-message';

export const createBoxPlotFunctionDefinition = (
  context: CustomFunctionContext<VisState>
): RegisterFunctionCallingProps => ({
  name: 'boxplot',
  description:
    'Create box plot, also called box-and-whisker plot, to visually present a summary of numeric variable using the following key elements: minimum value, lower quartile (q1), median value, upper quartile (q3), and maximum value.',
  properties: {
    variableNames: {
      type: 'array',
      items: {
        type: 'string'
      },
      description: 'A list of the variable names'
    },
    boundIQR: {
      type: 'number',
      description:
        'The multiplier for the IQR to determine outliers. The default value is 1.5. However, a value of 3.0 is common as well. It can also be called hinge value.'
    },
    datasetName: {
      type: 'string',
      description:
        'The name of the dataset. If not provided, please try to find the dataset name that contains the variableNames.'
    }
  },
  required: ['variableNames', 'datasetName'],
  callbackFunction: boxplotCallback,
  callbackFunctionContext: context,
  callbackMessage: customBoxPlotMessageCallback
});

export type BoxPlotCallbackResult = {
  id: string;
  datasetId: string;
  variables: string[];
  boundIQR: number;
  boxplot: BoxplotDataProps['boxData'];
};

export type BoxPlotCallbackData = BoxplotDataProps;

export type BoxPlotCallbackOutput = CustomFunctionOutputProps<
  BoxPlotCallbackResult | ErrorCallbackResult,
  BoxPlotCallbackData
>;

export function isCustomBoxPlotOutput(
  props: CustomFunctionOutputProps<unknown, unknown>
): props is BoxPlotCallbackOutput {
  return props.type === 'boxplot';
}

export function isBoxPlotCallbackResult(
  props: BoxPlotCallbackResult | ErrorCallbackResult
): props is BoxPlotCallbackResult {
  return (props as BoxPlotCallbackResult).boundIQR !== undefined;
}

export type BoxplotFunctionProps = {
  variableName: string;
  boundIQR: number;
  datasetName?: string;
};

export function boxplotCallback({
  functionName,
  functionArgs,
  functionContext
}: CallbackFunctionProps): BoxPlotCallbackOutput {
  const {boundIQR: inputIQR, variableName, datasetName} = functionArgs as BoxplotFunctionProps;
  const {visState} = functionContext as {visState: VisState};

  // convert inputIQR to number if it is not
  const boundIQR = typeof inputIQR === 'number' ? inputIQR : parseFloat(inputIQR);

  const keplerDataset = findKeplerDatasetByVariableName(
    datasetName,
    variableName,
    visState.datasets
  );
  if (!keplerDataset) {
    return createErrorResult({name: functionName, result: CHAT_COLUMN_DATA_NOT_FOUND});
  }

  // get data from variable
  const data: CreateBoxplotProps['data'] = [variableName].reduce(
    (prev: CreateBoxplotProps['data'], name: string) => {
      const values = getColumnDataFromKeplerDataset(name, keplerDataset);
      prev[name] = values;
      return prev;
    },
    {}
  );

  // check column data is empty
  if (!data || Object.keys(data).length === 0) {
    return createErrorResult({name: functionName, result: CHAT_COLUMN_DATA_NOT_FOUND});
  }

  // call boxplot function
  const boxplot = createBoxplot({data, boundIQR: boundIQR || 1.5});

  return {
    type: 'boxplot',
    name: 'boxplot',
    result: {
      id: generateRandomId(),
      datasetId: keplerDataset.id,
      variables: [variableName],
      boundIQR,
      boxplot: boxplot.boxData
    },
    data: boxplot
  };
}
