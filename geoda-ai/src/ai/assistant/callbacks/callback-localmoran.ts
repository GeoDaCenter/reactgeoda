import {localMoran} from 'geoda-wasm';

import {WeightsProps} from '@/reducers/weights-reducer';
import {createErrorResult, ErrorOutput} from '../custom-functions';
import {CHAT_FIELD_NAME_NOT_FOUND, CHAT_WEIGHTS_NOT_FOUND} from '@/constants';
import {
  checkIfFieldNameExists,
  getColumnDataFromKeplerLayer,
  isNumberArray
} from '@/utils/data-utils';

export type UniLocalMoranOutput = {
  type: 'lisa';
  name: string;
  result: {
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
  data: any;
};

type UniLocalMoranCallbackProps = {
  variableName: string;
  weightsID: string;
  permutations?: number;
  significanceThreshold?: number;
};

export async function univariateLocalMoranCallback(
  {
    variableName,
    weightsID,
    permutations = 999,
    significanceThreshold = 0.05
  }: UniLocalMoranCallbackProps,
  {tableName, visState, weights}: {tableName: string; visState: any; weights: WeightsProps[]}
): Promise<UniLocalMoranOutput | ErrorOutput> {
  // get weights using weightsID
  let selectWeight = weights.find((w: WeightsProps) => w.weightsMeta.id === weightsID);
  if (weights.length === 0) {
    return createErrorResult(CHAT_WEIGHTS_NOT_FOUND);
  }
  if (!selectWeight) {
    // using last weights if weightsID is not found
    selectWeight = weights[weights.length - 1];
  }

  // get table name from geodaState
  if (!tableName) {
    return createErrorResult('Error: table name is empty');
  }
  if (!checkIfFieldNameExists(tableName, variableName, visState)) {
    return createErrorResult(
      `${CHAT_FIELD_NAME_NOT_FOUND} For example, run local moran analysis using variable HR60 and KNN weights with k=4.`
    );
  }
  // get column data
  const columnData = await getColumnDataFromKeplerLayer(tableName, variableName, visState.datasets);
  if (!columnData || columnData.length === 0) {
    return createErrorResult('Error: column data is empty');
  }
  // check the type of columnData is an array of numbers
  if (!isNumberArray(columnData)) {
    return createErrorResult('Error: column data is not an array of numbers');
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
    name: 'Local Moran',
    result: {
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
