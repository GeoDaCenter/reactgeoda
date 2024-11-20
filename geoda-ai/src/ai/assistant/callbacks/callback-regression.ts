import {RegressionDataProps} from '@/reducers/regression-reducer';
import {findKeplerDatasetByVariableName} from '@/utils/data-utils';
import {WeightsProps} from '@/reducers/weights-reducer';
import {VisState} from '@kepler.gl/schemas';
import {CHAT_DATASET_NOT_FOUND, CHAT_WEIGHTS_NOT_FOUND} from '@/constants';
import {createErrorResult} from '../custom-functions';
import {printRegressionResult, runRegression} from '@/utils/regression-utils';
import {isCustomWeightsOutput} from '@/components/chatgpt/custom-weights-message';
import {
  CallbackFunctionProps,
  CustomFunctionContext,
  CustomFunctionOutputProps,
  ErrorCallbackResult,
  RegisterFunctionCallingProps
} from 'react-ai-assist';
import {customSpatialRegressionMessageCallback} from '@/components/chatgpt/custom-spreg-message';

export const spatialRegressionFunctionDefinition = (
  context: CustomFunctionContext<VisState | WeightsProps[]>
): RegisterFunctionCallingProps => ({
  name: 'spatialRegression',
  description:
    'Apply spatial regression analysis to find a linear relationship between a dependent variable Y and a set of explanatory or independent variables X. The equation is Y ~ X1 + X2 + ... Xn. The spatial regression model could be classic, spatial-lag or spatial-error model.',
  properties: {
    independentVariables: {
      type: 'array',
      items: {
        type: 'string'
      },
      description: 'A list of the independent or explanatory variable names X'
    },
    dependentVariable: {
      type: 'string',
      description: 'The name of dependent variable Y'
    },
    modelType: {
      type: 'string',
      description:
        'The type of regression model. It could be classic, spatial-lag or spatial-error. The default model type is classic. If not provided, please use classic model.'
    },
    weightsId: {
      type: 'string',
      description:
        'The id of the specified spatial weights. For classic model, the optional weightsId is for spatial diagnostics. For spatial-lag and spatial-error model, the weightsId is required. Please prompt user to provide spatial weights if needed.'
    },
    datasetName: {
      type: 'string',
      description:
        'The name of the dataset. If not provided, please try to find the dataset name that contains the independentVariables and dependentVariable.'
    }
  },
  required: ['independentVariables', 'dependentVariable', 'modelType', 'datasetName'],
  callbackFunction: spatialRegressionCallback,
  callbackFunctionContext: context,
  callbackMessage: customSpatialRegressionMessageCallback
});

export type RegressionCallbackResult = {
  dependentVariable: string;
  independentVariables: string[];
  weights: string;
  report: string;
  modelType?: string;
};

export type RegressionData = RegressionDataProps;

export type RegressionCallbackOutput = CustomFunctionOutputProps<
  RegressionCallbackResult | ErrorCallbackResult,
  RegressionData
>;

type SpatialRegressionCallbackFuncProps = {
  dependentVariable: string;
  independentVariables: string[];
  weightsId: string;
  modelType?: string;
  datasetName?: string;
  report?: string;
};

export async function spatialRegressionCallback({
  functionName,
  functionArgs,
  functionContext,
  previousOutput
}: CallbackFunctionProps): Promise<RegressionCallbackOutput> {
  const {dependentVariable, independentVariables, weightsId, modelType, datasetName} =
    functionArgs as SpatialRegressionCallbackFuncProps;

  const {visState, weights} = functionContext as {visState: VisState; weights: WeightsProps[]};

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
    if (weightsOutput && weightsOutput.data) {
      const {weightsMeta, weights} = weightsOutput.data;
      selectWeight = {
        datasetId: keplerDataset.id,
        weightsMeta,
        weights
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
