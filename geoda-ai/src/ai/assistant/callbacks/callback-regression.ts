import {RegressionDataProps} from '@/reducers/regression-reducer';
import {findKeplerDatasetByVariableName} from '@/utils/data-utils';
import {WeightsProps} from '@/reducers/weights-reducer';
import {VisState} from '@kepler.gl/schemas';
import {CHAT_DATASET_NOT_FOUND} from '@/constants';
import {createErrorResult, ErrorOutput} from '../custom-functions';
import {runRegression} from '@/utils/regression-utils';
import {printRegressionResult} from '@/components/spreg/spreg-report';
import {CustomFunctionOutputProps} from '@/ai/openai-utils';

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

export async function spatialRegressionCallbackFunc(
  functionName: string,
  {
    dependentVariable,
    independentVariables,
    weightsId,
    modelType,
    datasetName
  }: SpatialRegressionCallbackFuncProps,
  {visState, weights}: {visState: VisState; weights: WeightsProps[]}
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

  if (!weights || weights.length === 0 || !datasetName) {
    return createErrorResult({name: functionName, result: CHAT_DATASET_NOT_FOUND});
  }

  const regression = await runRegression({
    keplerDataset,
    model: modelType || 'classic',
    xVariables: independentVariables,
    yVariable: dependentVariable,
    weights,
    weightsId
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
