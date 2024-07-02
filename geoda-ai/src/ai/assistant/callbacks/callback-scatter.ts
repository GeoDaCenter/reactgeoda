import {generateRandomId} from '@/utils/ui-utils';
import {DataContainerInterface} from '@kepler.gl/utils';
import {createErrorResult, ErrorOutput} from '../custom-functions';
import {getColumnData} from '@/utils/data-utils';
import {CHAT_COLUMN_DATA_NOT_FOUND} from '@/constants';

export type ScatterplotOutput = {
  type: 'scatter';
  name: string;
  result: {
    id: string;
    variableX: string;
    variableY: string;
  };
};

type ScatterCallbackProps = {
  variableX: string;
  variableY: string;
};

export function scatterCallback(
  {variableX, variableY}: ScatterCallbackProps,
  {dataContainer}: {dataContainer: DataContainerInterface}
): ScatterplotOutput | ErrorOutput {
  const columnDataX = getColumnData(variableX, dataContainer);
  const columnDataY = getColumnData(variableY, dataContainer);

  // Check if both variables' data are successfully accessed
  if (!columnDataX || columnDataX.length === 0 || !columnDataY || columnDataY.length === 0) {
    return createErrorResult(CHAT_COLUMN_DATA_NOT_FOUND);
  }

  try {
    return {
      type: 'scatter',
      name: 'Scatterplot Data',
      result: {
        id: generateRandomId(),
        variableX,
        variableY
      }
    };
  } catch (error: any) {
    // if xData and yData arrays lengths do not match
    return {result: error.message};
  }
}
