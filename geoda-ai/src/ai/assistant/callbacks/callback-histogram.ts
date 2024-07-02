import {DataContainerInterface} from '@kepler.gl/utils';
import {createErrorResult, ErrorOutput} from '../custom-functions';
import {getColumnData} from '@/utils/data-utils';
import {HistogramDataProps, createHistogram} from '@/utils/plots/histogram-utils';
import {CHAT_COLUMN_DATA_NOT_FOUND} from '@/constants';
import {generateRandomId} from '@/utils/ui-utils';

export type HistogramOutput = {
  type: 'histogram';
  name: string;
  result: {
    id: string;
    variableName: string;
    numberOfBins: number;
    histogram: Array<Omit<HistogramDataProps, 'items'>>;
  };
  data: HistogramDataProps[];
};

type HistogramCallbackProps = {
  k: number;
  variableName: string;
};

export function histogramCallback(
  {k, variableName}: HistogramCallbackProps,
  {dataContainer}: {dataContainer: DataContainerInterface}
): HistogramOutput | ErrorOutput {
  // get column data
  const columnData = getColumnData(variableName, dataContainer);

  // check column data is empty
  if (!columnData || columnData.length === 0) {
    return createErrorResult(CHAT_COLUMN_DATA_NOT_FOUND);
  }

  // call histogram function
  const histogram = createHistogram(columnData, k);

  return {
    type: 'histogram',
    name: 'Histogram',
    result: {
      id: generateRandomId(),
      variableName,
      numberOfBins: k,
      histogram
    },
    data: histogram
  };
}
