import {DataContainerInterface} from '@kepler.gl/utils';
import {CreateParallelCoordinateProps} from '@/utils/plots/parallel-coordinate-utils';

import {createErrorResult, ErrorOutput} from '../custom-functions';
import {getColumnData} from '@/utils/data-utils';
import {CHAT_COLUMN_DATA_NOT_FOUND, CHAT_NOT_ENOUGH_COLUMNS} from '@/constants';
import {generateRandomId} from '@/utils/ui-utils';

export function parallelCoordinateCallback(
  {variableNames}: {variableNames: string[]},
  {dataContainer}: {dataContainer: DataContainerInterface}
): ParallelCoordinateOutput | ErrorOutput {
  // get data from variable
  const data: CreateParallelCoordinateProps['data'] = variableNames.reduce(
    (prev: CreateParallelCoordinateProps['data'], cur: string) => {
      const values = getColumnData(cur, dataContainer);
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
    name: 'ParallelCoordinate',
    result: {
      id: generateRandomId(),
      variables: variableNames
    }
  };
}

export type ParallelCoordinateOutput = {
  type: 'parallel-coordinate';
  name: string;
  result: {
    id: string;
    variables: string[];
  };
};
