import {
  localG,
  localGeary,
  localGStar,
  localMoran,
  LocalMoranResult as LisaResult,
  quantileLisa
} from 'geoda-wasm';

import {WeightsProps} from '@/reducers/weights-reducer';
import {createErrorResult} from '../custom-functions';
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
import {isCustomWeightsOutput} from '@/components/chatgpt/custom-weights-message';
import {
  CallbackFunctionProps,
  CustomFunctionContextCallback,
  CustomFunctionOutputProps,
  ErrorCallbackResult,
  RegisterFunctionCallingProps
} from 'soft-ai';
import {customLisaMessageCallback} from '@/components/chatgpt/custom-lisa-message';

export const lisaFunctionDefinition = (
  context: CustomFunctionContextCallback<VisState | WeightsProps[]>
): RegisterFunctionCallingProps => ({
  name: 'lisa',
  description:
    'Apply local indicators of spatial association (LISA) statistics, which inlcude local moran, local G, local G*, local Geary and Quantile LISA, to identify local clusters (e.g. hot spots and cold spots) or local spatial outliers of a specific variable and a specific spatial weights.',
  properties: {
    method: {
      type: 'string',
      description:
        "The name of the LISA method. It could be one of the following methods: localMoran, localGeary, localG, localGStar, quantileLisa. The localG is for local Getis-Ord's G"
    },
    weightsID: {
      type: 'string',
      description:
        'The weightsID that is mapping to user created spatial weights based on the dataset name, type and properties when creating the spatial weights. If no weightsID can be found, please try to call function tool to create spatial weights if weights type is provided. Otherwise, please prompt user to create spatial weights first.'
    },
    variableName: {
      type: 'string',
      description: 'The variable name.'
    },
    multiVariableNames: {
      type: 'array',
      items: {
        type: 'string'
      },
      description:
        "A list of the variable names. This property is only used in multivariate LISA methods: e.g. multivariate local moran. If multivariate LISA is specified, please don't use variableName."
    },
    biVariableNames: {
      type: 'array',
      items: {
        type: 'string'
      },
      description:
        "A list of the variable names. This property is only used in bivariate LISA methods: e.g. bivariate local moran. If bivariate LISA is specified, please don't use variableName."
    },
    permutation: {
      type: 'number',
      description:
        'The number of possible arrangements or permutations in the conditional permutation test carried out in local moran statistics. Default permutation number is 999'
    },
    significanceThreshold: {
      type: 'number',
      description:
        'The significance threshold is a value between 0 and 1 that is used to determine whether a probability is significant or not. Default value is 0.05'
    },
    datasetName: {
      type: 'string',
      description:
        'The name of the dataset. If not provided, please try to find the dataset name that contains the variableName.'
    }
  },
  required: ['method', 'weightsID', 'variableName', 'datasetName'],
  callbackFunction: lisaCallback,
  callbackFunctionContext: context,
  callbackMessage: customLisaMessageCallback
});

export type LisaCallbackResult = {
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

export type LisaData = LisaResult;

export type LisaCallbackOutput = CustomFunctionOutputProps<
  LisaCallbackResult | ErrorCallbackResult,
  LisaData
>;

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

export async function lisaCallback({
  functionName,
  functionArgs,
  functionContext,
  previousOutput
}: CallbackFunctionProps): Promise<LisaCallbackOutput> {
  const {
    method,
    datasetName,
    variableName,
    weightsID,
    permutations: inputPermutations,
    significanceThreshold: inputSignificanceThreshold
  } = functionArgs as LisaCallbackProps;

  const context =
    typeof functionContext === 'function'
      ? (functionContext as CustomFunctionContextCallback<VisState | WeightsProps[]>)()
      : functionContext;

  const {visState, weights} = context as {
    visState: VisState;
    weights: WeightsProps[];
  };

  // convert inputPermutations to number if it is not
  let permutations = inputPermutations || 999;
  if (typeof inputPermutations === 'string') {
    permutations = parseInt(inputPermutations, 10);
  }

  // convert inputSignificanceThreshold to number if it is not
  let significanceThreshold = inputSignificanceThreshold || 0.05;
  if (typeof inputSignificanceThreshold === 'string') {
    significanceThreshold = parseFloat(inputSignificanceThreshold);
    if (significanceThreshold <= 0 || significanceThreshold >= 1) {
      significanceThreshold = 0.05;
    }
  }

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
    if (weightsOutput && weightsOutput.data) {
      const {datasetId, weightsMeta, weights} = weightsOutput.data;
      selectWeight = {
        datasetId,
        weightsMeta,
        weights
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
