import {BoxplotDataProps, CreateBoxplotProps, createBoxplot} from '@/utils/plots/boxplot-utils';
import {createErrorResult, ErrorOutput} from '../custom-functions';
import {findKeplerDatasetByVariableName, getColumnDataFromKeplerDataset} from '@/utils/data-utils';
import {CHAT_COLUMN_DATA_NOT_FOUND} from '@/constants';
import {generateRandomId} from '@/utils/ui-utils';
import {KeplerGlState} from '@kepler.gl/reducers';

export type BoxplotOutput = {
  type: 'boxplot';
  name: string;
  result: {
    id: string;
    datasetId: string;
    variables: string[];
    boundIQR: number;
    boxplot: BoxplotDataProps['boxData'];
  };
  data: BoxplotDataProps;
};

export type BoxplotFunctionProps = {
  variableNames: string[];
  boundIQR: number;
  datasetName?: string;
};

export function boxplotCallback(
  {variableNames, boundIQR, datasetName}: BoxplotFunctionProps,
  {visState}: {visState: KeplerGlState['visState']}
): BoxplotOutput | ErrorOutput {
  const keplerDataset = findKeplerDatasetByVariableName(
    datasetName,
    variableNames[0],
    visState.datasets
  );
  if (!keplerDataset) {
    return createErrorResult(CHAT_COLUMN_DATA_NOT_FOUND);
  }

  // get data from variable
  const data: CreateBoxplotProps['data'] = variableNames.reduce(
    (prev: CreateBoxplotProps['data'], cur: string) => {
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

  // call boxplot function
  const boxplot = createBoxplot({data, boundIQR: boundIQR || 1.5});

  return {
    type: 'boxplot',
    name: 'Boxplot',
    result: {
      id: generateRandomId(),
      datasetId: keplerDataset.id,
      variables: variableNames,
      boundIQR,
      boxplot: boxplot.boxData
    },
    data: boxplot
  };
}
