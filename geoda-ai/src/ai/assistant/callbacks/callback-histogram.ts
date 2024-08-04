import {createErrorResult, ErrorOutput} from '../custom-functions';
import {findKeplerDatasetByVariableName, getColumnDataFromKeplerDataset} from '@/utils/data-utils';
import {HistogramDataProps, createHistogram} from '@/utils/plots/histogram-utils';
import {CHAT_COLUMN_DATA_NOT_FOUND} from '@/constants';
import {generateRandomId} from '@/utils/ui-utils';
import {KeplerGlState} from '@kepler.gl/reducers';

/**
 * Output of the histogram callback function.
 * It contains the result of the histogram that will be sent to the LLM assistant.
 * It also contains the histogram data that will be used to create histogram plot if custom message is enabled.
 *
 */
export type HistogramOutput = {
  type: 'histogram';
  name: string;
  result: {
    id: string;
    datasetId: string;
    datasetName: string;
    variableName: string;
    numberOfBins: number;
    histogram: Array<Omit<HistogramDataProps, 'items'>>;
  };
  data: HistogramDataProps[];
};

type HistogramCallbackProps = {
  k: number;
  variableName: string;
  datasetName?: string;
};

export function histogramCallback(
  {k, variableName, datasetName}: HistogramCallbackProps,
  {visState}: {visState: KeplerGlState['visState']}
): HistogramOutput | ErrorOutput {
  // get dataset using dataset name from visState
  const keplerDataset = findKeplerDatasetByVariableName(
    datasetName,
    variableName,
    visState.datasets
  );
  if (!keplerDataset) {
    return createErrorResult(CHAT_COLUMN_DATA_NOT_FOUND);
  }

  // get column data
  const columnData = getColumnDataFromKeplerDataset(variableName, keplerDataset);

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
      datasetId: keplerDataset.id,
      datasetName: keplerDataset.label,
      variableName,
      numberOfBins: k,
      histogram
    },
    data: histogram
  };
}
