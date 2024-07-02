import {BoxplotDataProps, CreateBoxplotProps, createBoxplot} from '@/utils/plots/boxplot-utils';
import {DataContainerInterface} from '@kepler.gl/utils';
import {createErrorResult, ErrorOutput} from '../custom-functions';
import {getColumnData} from '@/utils/data-utils';
import {CHAT_COLUMN_DATA_NOT_FOUND} from '@/constants';
import {generateRandomId} from '@/utils/ui-utils';

export type BoxplotOutput = {
  type: 'boxplot';
  name: string;
  result: {
    id: string;
    variables: string[];
    boundIQR: number;
    boxplot: BoxplotDataProps['boxData'];
  };
  data: BoxplotDataProps;
};

export type BoxplotFunctionProps = {
  variableNames: string[];
  boundIQR: number;
};

export function boxplotCallback(
  {variableNames, boundIQR}: BoxplotFunctionProps,
  {dataContainer}: {dataContainer: DataContainerInterface}
): BoxplotOutput | ErrorOutput {
  // get data from variable
  const data: CreateBoxplotProps['data'] = variableNames.reduce(
    (prev: CreateBoxplotProps['data'], cur: string) => {
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

  // call boxplot function
  const boxplot = createBoxplot({data, boundIQR: boundIQR || 1.5});

  return {
    type: 'boxplot',
    name: 'Boxplot',
    result: {
      id: generateRandomId(),
      variables: variableNames,
      boundIQR,
      boxplot: boxplot.boxData
    },
    data: boxplot
  };
}
