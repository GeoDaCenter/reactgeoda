import {CreateBoxplotProps, createBoxplot} from '@/utils/plots/boxplot-utils';
import {createErrorResult} from '../custom-functions';
import {findKeplerDatasetByVariableName, getColumnDataFromKeplerDataset} from '@/utils/data-utils';
import {CHAT_COLUMN_DATA_NOT_FOUND} from '@/constants';
import {generateRandomId} from '@/utils/ui-utils';
import {
  CallbackFunctionProps,
  CustomFunctionOutputProps,
  ErrorCallbackResult
} from '@openassistant/core';
import {VisState} from '@kepler.gl/schemas';
import {BoxplotDataProps} from '@openassistant/echarts';

export type BoxPlotCallbackResult = {
  id: string;
  datasetId: string;
  datasetName: string;
  variables: string[];
  boundIQR: number;
  boxplot: BoxplotDataProps['boxplots'];
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
      datasetName: datasetName || '',
      variables: [variableName],
      boundIQR,
      boxplot: boxplot.boxData
    },
    data: boxplot
  };
}
