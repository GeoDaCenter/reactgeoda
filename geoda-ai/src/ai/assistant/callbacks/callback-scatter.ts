import {generateRandomId} from '@/utils/ui-utils';
import {createErrorResult, ErrorOutput} from '../custom-functions';
import {findKeplerDatasetByVariableName, getColumnDataFromKeplerDataset} from '@/utils/data-utils';
import {CHAT_COLUMN_DATA_NOT_FOUND} from '@/constants';
import {KeplerGlState} from '@kepler.gl/reducers';

export type ScatterplotOutput = {
  type: 'scatter';
  name: string;
  result: {
    id: string;
    datasetId: string;
    datasetName: string;
    variableX: string;
    variableY: string;
  };
  // data is not needed for classic scatter plot, but when linear regression is added, it will be used
};

type ScatterCallbackProps = {
  variableX: string;
  variableY: string;
  datasetName?: string;
};

export function scatterCallback(
  {variableX, variableY, datasetName}: ScatterCallbackProps,
  {visState}: {visState: KeplerGlState['visState']}
): ScatterplotOutput | ErrorOutput {
  console.log('scatterCallback', variableX, variableY, datasetName);
  // get dataset using dataset name from visState
  const keplerDataset = findKeplerDatasetByVariableName(datasetName, variableX, visState.datasets);
  if (!keplerDataset) {
    return createErrorResult(CHAT_COLUMN_DATA_NOT_FOUND);
  }

  const columnDataX = getColumnDataFromKeplerDataset(variableX, keplerDataset);
  const columnDataY = getColumnDataFromKeplerDataset(variableY, keplerDataset);

  // Check if both variables' data are successfully accessed
  if (!columnDataX || columnDataX.length === 0 || !columnDataY || columnDataY.length === 0) {
    return createErrorResult(CHAT_COLUMN_DATA_NOT_FOUND);
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
