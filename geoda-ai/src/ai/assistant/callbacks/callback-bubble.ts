import {getColumnData} from '@/utils/data-utils';
import {createErrorResult, ErrorOutput} from '../custom-functions';
import {CHAT_COLUMN_DATA_NOT_FOUND} from '@/constants';
import {generateRandomId} from '@/utils/ui-utils';
import {DataContainerInterface} from '@kepler.gl/utils';

export type BubbleChartOutput = {
  type: 'bubble';
  name: string;
  result: {
    id: string;
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
};

export function bubbleCallback(
  {variableX, variableY, variableSize, variableColor}: BubbleCallbackProps,
  {dataContainer}: {dataContainer: DataContainerInterface}
): BubbleChartOutput | ErrorOutput {
  const columnDataX = getColumnData(variableX, dataContainer);
  const columnDataY = getColumnData(variableY, dataContainer);
  const columnDataSize = getColumnData(variableSize, dataContainer);
  const columnDataColor = variableColor ? getColumnData(variableColor, dataContainer) : undefined;

  // Check if both variables' data are successfully accessed
  if (
    !columnDataX ||
    columnDataX.length === 0 ||
    !columnDataY ||
    columnDataY.length === 0 ||
    !columnDataSize ||
    columnDataSize.length === 0
  ) {
    return createErrorResult(CHAT_COLUMN_DATA_NOT_FOUND);
  }

  if (variableColor && (!columnDataColor || columnDataColor.length === 0)) {
    return createErrorResult(CHAT_COLUMN_DATA_NOT_FOUND);
  }

  return {
    type: 'bubble',
    name: 'Bubble Chart Data',
    result: {
      id: generateRandomId(),
      variableX,
      variableY,
      variableSize,
      variableColor
    }
  };
}
