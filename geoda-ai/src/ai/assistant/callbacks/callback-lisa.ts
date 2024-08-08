import {
  localG,
  localGeary,
  localGStar,
  localMoran,
  LocalMoranResult as LisaResult,
  quantileLisa
} from 'geoda-wasm';

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
import {isCustomWeightsOutput} from '@/components/chatgpt/custom-weights-message';

export type LisaResultToLLM = {
  lisaMethod: string;
  success: true;
  datasetId: string;
  significanceThreshold: number;
  variableName: string;
  permutations: number;
  globalMoranI?: number;
  clusters: Array<{
    label: string;
    color: string;
    numberOfObservations: number;
  }>;
};

type LisaData = LisaResult;

export type LisaCallbackOutput = CustomFunctionOutputProps<LisaResultToLLM, LisaData> & {
  type: 'lisa';
};

type LisaCallbackProps = {
  method: string;
  variableName: string;
  biVariableNames?: string[];
  multiVariableNames?: string[];
  weightsID: string;
  permutations?: number;
  significanceThreshold?: number;
  datasetName?: string;
};

export async function lisaCallback(
  functionName: string,
  {
    method,
    datasetName,
    variableName,
    weightsID,
    permutations = 999,
    significanceThreshold = 0.05
  }: LisaCallbackProps,
  {visState, weights}: {visState: VisState; weights: WeightsProps[]},
  previousOutput?: CustomFunctionOutputProps<unknown, unknown>[]
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

  // get weights from previous LLM output if weights creation is an intermediate step
  if (previousOutput && previousOutput.length > 0) {
    const weightsOutput = previousOutput.find(output => isCustomWeightsOutput(output));
    if (weightsOutput) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const {datasetId, success, ...weightsMeta} = weightsOutput.result;
      selectWeight = {
        datasetId,
        weightsMeta,
        weights: weightsOutput.data as number[][]
      };
    }
  }

  if (!selectWeight) {
    // using last weights if weightsID is not found
    selectWeight = weights.length > 0 ? weights[weights.length - 1] : undefined;
  }

  if (!selectWeight) {
    return createErrorResult({name: functionName, result: CHAT_WEIGHTS_NOT_FOUND});
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

  let lisaFunction = localMoran;
  let globalMoranI: number | null = null;

  if (method === 'localGeary') {
    lisaFunction = localGeary;
  } else if (method === 'localG') {
    lisaFunction = localG;
  } else if (method === 'localGStar') {
    lisaFunction = localGStar;
  } else if (method === 'quantileLisa') {
    // @ts-ignore
    lisaFunction = quantileLisa;
  }

  // run LISA analysis
  const lm = await lisaFunction({
    data: columnData,
    neighbors: selectWeight?.weights,
    permutation: permutations,
    significanceCutoff: significanceThreshold
  });

  // calculate global Moran's I
  if (method === 'localMoran') {
    globalMoranI = lm.lisaValues.reduce((a, b) => a + b, 0) / lm.lisaValues.length;
  }

  // get meta data for each cluster
  const metaDataOfClusters = lm.labels.map((label, i) => {
    return {
      label,
      color: lm.colors[i],
      numberOfObservations: lm.clusters.filter(c => c === i).length
    };
  });

  return {
    type: 'lisa',
    name: functionName,
    result: {
      lisaMethod: method,
      success: true,
      datasetId,
      significanceThreshold,
      variableName,
      permutations,
      clusters: metaDataOfClusters,
      ...(globalMoranI ? {globalMoranI} : {})
    },
    data: lm
  };
}
