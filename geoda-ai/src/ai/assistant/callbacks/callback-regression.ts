import {RegressionDataProps} from '@/reducers/regression-reducer';
import {findKeplerDatasetByVariableName} from '@/utils/data-utils';
import {WeightsProps} from '@/reducers/weights-reducer';
import {VisState} from '@kepler.gl/schemas';
import {CHAT_DATASET_NOT_FOUND, CHAT_WEIGHTS_NOT_FOUND} from '@/constants';
import {createErrorResult, ErrorOutput} from '../custom-functions';
import {runRegression} from '@/utils/regression-utils';
import {printRegressionResult} from '@/components/spreg/spreg-report';
import {CustomFunctionOutputProps} from '@/ai/types';
import {isCustomWeightsOutput} from '@/components/chatgpt/custom-weights-message';

type RegressionResult = {
  dependentVariable: string;
  independentVariables: string[];
  weights: string;
  report: string;
  modelType?: string;
};

type RegressionData = RegressionDataProps;

export type RegressionCallbackOutput = CustomFunctionOutputProps<
  RegressionResult,
  RegressionData
> & {
  type: 'regression';
};

type SpatialRegressionCallbackFuncProps = {
  dependentVariable: string;
  independentVariables: string[];
  weightsId: string;
  modelType?: string;
  datasetName?: string;
  report?: string;
};

export async function spatialRegressionCallback(
  functionName: string,
  {
    dependentVariable,
    independentVariables,
    weightsId,
    modelType,
    datasetName
  }: SpatialRegressionCallbackFuncProps,
  {visState, weights}: {visState: VisState; weights: WeightsProps[]},
  previousOutput?: CustomFunctionOutputProps<unknown, unknown>[]
): Promise<RegressionCallbackOutput | ErrorOutput> {
  // get dataset using dataset name from visState
  const keplerDataset = findKeplerDatasetByVariableName(
    datasetName,
    dependentVariable,
    visState.datasets
  );
  if (!keplerDataset) {
    return createErrorResult({name: functionName, result: CHAT_DATASET_NOT_FOUND});
  }

  // get weights using weightsID
  let selectWeight = weights.find((w: WeightsProps) => w.weightsMeta.id === weightsId);

  // get weights from previous LLM output if weights creation is an intermediate step
  if (previousOutput && previousOutput.length > 0) {
    const weightsOutput = previousOutput.find(output => isCustomWeightsOutput(output));
    if (weightsOutput) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const {datasetId, success, ...weightsMeta} = weightsOutput.result;
      selectWeight = {
        datasetId: keplerDataset.id,
        weightsMeta,
        weights: weightsOutput.data as number[][]
      };
    }
  }

  if (modelType && (modelType === 'spatial-lag' || modelType === 'spatial-error')) {
    if (!selectWeight) {
      return createErrorResult({
        name: functionName,
        result:
          'For spatial lag or spatial error model, a spatial weights is required. ' +
          CHAT_WEIGHTS_NOT_FOUND
      });
    }
  }

  const regression = await runRegression({
    keplerDataset,
    model: modelType || 'classic',
    xVariables: independentVariables,
    yVariable: dependentVariable,
    weights: selectWeight
  });

  const report = regression.result;
  const regressionReport = printRegressionResult(report);

  return {
    type: 'regression',
    name: functionName,
    result: {
      dependentVariable,
      independentVariables,
      weights: weightsId,
      modelType: modelType,
      report: regressionReport
    },
    data: {
      datasetName: keplerDataset.label,
      dependentVariable,
      independentVariables,
      weights: weightsId,
      modelType: modelType,
      result: report
    }
  };
}
