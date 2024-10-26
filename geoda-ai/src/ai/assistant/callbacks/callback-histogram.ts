import {createErrorResult} from '../custom-functions';
import {findKeplerDatasetByVariableName, getColumnDataFromKeplerDataset} from '@/utils/data-utils';
import {HistogramDataProps, createHistogram} from '@/utils/plots/histogram-utils';
import {CHAT_COLUMN_DATA_NOT_FOUND} from '@/constants';
import {generateRandomId} from '@/utils/ui-utils';
import {
  CallbackFunctionProps,
  CustomFunctionContext,
  CustomFunctionOutputProps,
  ErrorCallbackResult,
  RegisterFunctionCallingProps
} from 'soft-ai';
import {VisState} from '@kepler.gl/schemas';
import {customHistogramMessageCallback} from '@/components/chatgpt/custom-histogram-message';

export const createHistogramFunctionDefinition = (
  context: CustomFunctionContext<VisState>
): RegisterFunctionCallingProps => ({
  name: 'histogram',
  description: 'Create a histogram for a specific variable.',
  properties: {
    k: {
      type: 'number',
      description:
        'The number of bins or intervals that the data will be group into. The default value is 7.'
    },
    variableName: {
      type: 'string',
      description: 'The name of a numeric variable.'
    },
    datasetName: {
      type: 'string',
      description:
        'The name of the dataset. If not provided, please try to find the dataset name that contains the variableName. The default value is the name of the first dataset.'
    }
  },
  required: ['variableName'],
  callbackFunction: histogramCallback,
  callbackFunctionContext: context,
  callbackMessage: customHistogramMessageCallback
});

export type HistogramCallbackResult = {
  id: string;
  datasetId: string;
  datasetName: string;
  variableName: string;
  numberOfBins: number;
  histogram: Array<Omit<HistogramDataProps, 'items'>>;
};

export type HistogramCallbackData = HistogramDataProps[];

export type HistogramCallbackOutput = CustomFunctionOutputProps<
  HistogramCallbackResult | ErrorCallbackResult,
  HistogramCallbackData
>;

export type HistogramCallbackProps = {
  k: number;
  variableName: string;
  datasetName?: string;
};

export function histogramCallback({
  functionName,
  functionArgs,
  functionContext
}: CallbackFunctionProps): HistogramCallbackOutput {
  const {k: inputK, variableName, datasetName} = functionArgs as HistogramCallbackProps;
  const {visState} = functionContext as {visState: VisState};

  // convert inputK to number if it is not
  let k = inputK || 7;
  if (typeof inputK === 'string') {
    k = parseInt(inputK, 10);
  }

  // get dataset using dataset name from visState
  const keplerDataset = findKeplerDatasetByVariableName(
    datasetName,
    variableName,
    visState.datasets
  );
  if (!keplerDataset) {
    return createErrorResult({name: functionName, result: CHAT_COLUMN_DATA_NOT_FOUND});
  }

  // get column data
  const columnData = getColumnDataFromKeplerDataset(variableName, keplerDataset);

  // check column data is empty
  if (!columnData || columnData.length === 0) {
    return createErrorResult({name: functionName, result: CHAT_COLUMN_DATA_NOT_FOUND});
  }

  // call histogram function
  const histogram = createHistogram(columnData, k);

  return {
    type: 'histogram',
    name: 'histogram',
    result: {
      id: generateRandomId(),
      datasetId: keplerDataset.id,
      datasetName: keplerDataset.label,
      variableName,
      numberOfBins: k,
      histogram
    },
    data: histogram
  };
}
