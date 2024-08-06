import {localMoran, LocalMoranResult} from 'geoda-wasm';

import {WeightsProps} from '@/reducers/weights-reducer';
import {createErrorResult, ErrorOutput} from '../custom-functions';
import {
  CHAT_COLUMN_DATA_NOT_FOUND,
  CHAT_DATASET_NOT_FOUND,
  CHAT_WEIGHTS_NOT_FOUND
} from '@/constants';
import {
  findKeplerDatasetByVariableName,
  getColumnDataFromKeplerDataset,
  isNumberArray
} from '@/utils/data-utils';
import {VisState} from '@kepler.gl/schemas';
import {CustomFunctionOutputProps} from '@/ai/types';

export type LisaResult = {
  datasetId: string;
  significanceThreshold: number;
  permutations: number;
  variableName: string;
  weightsID: string;
  numberOfHighHighClusters: number;
  numberOfLowLowClusters: number;
  numberOfHighLowClusters: number;
  numberOfLowHighClusters: number;
  numberOfIsolatedClusters: number;
  globalMoranI: number;
};

type LisaData = LocalMoranResult;

export type LisaCallbackOutput = CustomFunctionOutputProps<LisaResult, LisaData> & {
  type: 'lisa';
};

type UniLocalMoranCallbackProps = {
  variableName: string;
  weightsID: string;
  permutations?: number;
  significanceThreshold?: number;
  datasetName?: string;
};

export async function univariateLocalMoranCallback(
  functionName: string,
  {
    datasetName,
    variableName,
    weightsID,
    permutations = 999,
    significanceThreshold = 0.05
  }: UniLocalMoranCallbackProps,
  {visState, weights}: {visState: VisState; weights: WeightsProps[]}
): Promise<LisaCallbackOutput | ErrorOutput> {
  // get dataset using dataset name from visState
  const keplerDataset = findKeplerDatasetByVariableName(
    datasetName,
    variableName,
    visState.datasets
  );
  if (!keplerDataset) {
    return createErrorResult({name: functionName, result: CHAT_DATASET_NOT_FOUND});
  }

  // get weights using weightsID
  let selectWeight = weights.find((w: WeightsProps) => w.weightsMeta.id === weightsID);
  if (weights.length === 0) {
    return createErrorResult({name: functionName, result: CHAT_WEIGHTS_NOT_FOUND});
  }
  if (!selectWeight) {
    // using last weights if weightsID is not found
    selectWeight = weights[weights.length - 1];
  }

  const datasetId = keplerDataset.id;
  const columnData = getColumnDataFromKeplerDataset(variableName, keplerDataset);
  if (!columnData || columnData.length === 0) {
    return createErrorResult({name: functionName, result: CHAT_COLUMN_DATA_NOT_FOUND});
  }

  // check the type of columnData is an array of numbers
  if (!isNumberArray(columnData)) {
    return createErrorResult({
      name: functionName,
      result: 'Error: column data is not an array of numbers'
    });
  }

  // run LISA analysis
  const lm = await localMoran({
    data: columnData,
    neighbors: selectWeight?.weights,
    permutation: permutations
  });

  // get cluster values using significant cutoff
  const clusters = lm.pValues.map((p: number, i) => {
    if (p > significanceThreshold) {
      return 0;
    }
    return lm.clusters[i];
  });

  return {
    type: 'lisa',
    name: functionName,
    result: {
      datasetId,
      significanceThreshold,
      permutations,
      variableName,
      weightsID,
      numberOfHighHighClusters: clusters.filter(c => c === 1).length,
      numberOfLowLowClusters: clusters.filter(c => c === 2).length,
      numberOfHighLowClusters: clusters.filter(c => c === 3).length,
      numberOfLowHighClusters: clusters.filter(c => c === 4).length,
      numberOfIsolatedClusters: clusters.filter(c => c === 5).length,
      globalMoranI: lm.lisaValues.reduce((a, b) => a + b, 0) / lm.lisaValues.length
    },
    data: lm
  };
}
