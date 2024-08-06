import {findKeplerDatasetByVariableName, getColumnDataFromKeplerDataset} from '@/utils/data-utils';
import {createErrorResult, ErrorOutput} from '../custom-functions';
import {CHAT_COLUMN_DATA_NOT_FOUND} from '@/constants';
import {generateRandomId} from '@/utils/ui-utils';
import {KeplerGlState} from '@kepler.gl/reducers';

export type BubbleChartCallbackOutput = {
  type: 'bubble';
  name: string;
  result: {
    id: string;
    datasetId: string;
    datasetName: string;
    variableX: string;
    variableY: string;
    variableSize: string;
    variableColor?: string;
  };
};

type BubbleCallbackProps = {
  variableX: string;
  variableY: string;
  variableSize: string;
  variableColor?: string;
  datasetName?: string;
};

export function bubbleCallback(
  functionName: string,
  {variableX, variableY, variableSize, variableColor, datasetName}: BubbleCallbackProps,
  {visState}: {visState: KeplerGlState['visState']}
): BubbleChartCallbackOutput | ErrorOutput {
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
