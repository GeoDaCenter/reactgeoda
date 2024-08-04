import {CreateParallelCoordinateProps} from '@/utils/plots/parallel-coordinate-utils';

import {createErrorResult, ErrorOutput} from '../custom-functions';
import {findKeplerDatasetByVariableName, getColumnDataFromKeplerDataset} from '@/utils/data-utils';
import {CHAT_COLUMN_DATA_NOT_FOUND, CHAT_NOT_ENOUGH_COLUMNS} from '@/constants';
import {generateRandomId} from '@/utils/ui-utils';
import {KeplerGlState} from '@kepler.gl/reducers';

export type ParallelCoordinateOutput = {
  type: 'parallel-coordinate';
  name: string;
  result: {
    id: string;
    datasetId: string;
    datasetName: string;
    variables: string[];
  };
  // data is not needed for parallel coordinate plot for now
};

type ParallelCoordinateCallbackProps = {
  variableNames: string[];
  datasetName?: string;
};

export function parallelCoordinateCallback(
  {variableNames, datasetName}: ParallelCoordinateCallbackProps,
  {visState}: {visState: KeplerGlState['visState']}
): ParallelCoordinateOutput | ErrorOutput {
  // get dataset using dataset name from visState
  const keplerDataset = findKeplerDatasetByVariableName(
    datasetName,
    variableNames[0],
    visState.datasets
  );
  if (!keplerDataset) {
    return createErrorResult(CHAT_COLUMN_DATA_NOT_FOUND);
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
    return createErrorResult(CHAT_COLUMN_DATA_NOT_FOUND);
  }

  // check if there are at least 2 columns
  if (Object.keys(data).length === 1) {
    return createErrorResult(CHAT_NOT_ENOUGH_COLUMNS);
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
