import {DUCKDB_AGGREGATE_FUNCTIONS, DUCKDB_STATS_FUNCTIONS} from '@/components/table/sql-constant';
import {generateNormalDistributionData, generateUniformRandomData} from '@/utils/table-utils';
import {createErrorResult} from '../custom-functions';
import {CHAT_DATASET_NOT_FOUND} from '@/constants';
import {VisState} from '@kepler.gl/schemas';
import {
  CallbackFunctionProps,
  CustomFunctionContext,
  CustomFunctionOutputProps,
  ErrorCallbackResult,
  RegisterFunctionCallingProps
} from 'react-ai-assist';
import {customCreateVariableMessageCallback} from '@/components/chatgpt/custom-create-variable-message';

export const createVariableFunctionDefinition = (
  context: CustomFunctionContext<VisState | ((queryString: string) => Promise<unknown[]>)>
): RegisterFunctionCallingProps => ({
  name: 'createVariable',
  description: 'Create a new variable or column.',
  properties: {
    variableName: {
      type: 'string',
      description: 'The name of the new variable or column.'
    },
    dataType: {
      type: 'string',
      description:
        'The data type of the new variable or column. It could be integer, string or real.'
    },
    defaultValue: {
      type: 'string',
      description:
        "The default value that is assigned to the new variable or column. It could be a number, e.g. 0 or 1. It could be a description, e.g. random numbers or normal random. Please return 'uniform_random' for random numbers, return 'normal_random' for normal random numbers."
    },
    expression: {
      type: 'string',
      description:
        'The expression that is used to create the new variable by composing with other variables.  For example, (A + B), or (A / B). Please add round brackets to the expression. Please return the expression within a pair of round brackets.'
    },
    datasetName: {
      type: 'string',
      description:
        'The name of the dataset. If not provided, please try to use the first dataset. Otherwise, please prompt the user to provide the dataset name for the new variable.'
    }
  },
  required: ['dataType', 'variableName', 'datasetName'],
  callbackFunction: createVariableCallBack,
  callbackFunctionContext: context,
  callbackMessage: customCreateVariableMessageCallback
});

type CreateVariableResult = {
  newColumn: string;
  columnType: string;
  defaultValue?: string;
  expression?: string;
};

type CreateVariableData = {
  datasetName: string;
  datasetId?: string;
  numberOfRows?: number;
  newColumn: string;
  columnType: string;
  defaultValue?: string;
  expression?: string;
  values: unknown | unknown[];
};

export type CreateVariableCallbackOutput = CustomFunctionOutputProps<
  CreateVariableResult | ErrorCallbackResult,
  CreateVariableData
>;

type CreateVariableCallBackProps = {
  tableName: string;
  variableName: string;
  dataType: string;
  defaultValue?: string;
  expression?: string;
  datasetName?: string;
};

export async function createVariableCallBack({
  functionName,
  functionArgs,
  functionContext
}: CallbackFunctionProps): Promise<CreateVariableCallbackOutput> {
  const {variableName, dataType, defaultValue, expression, datasetName} =
    functionArgs as CreateVariableCallBackProps;
  const {visState, queryValues} = functionContext as {
    visState: VisState;
    queryValues: (sql: string) => Promise<unknown[]>;
  };

  if (!datasetName) {
    return createErrorResult({name: functionName, result: CHAT_DATASET_NOT_FOUND});
  }

  // get dataset using dataset name from visState
  const keplerDataset = Object.values(visState.datasets).find(d => d.label === datasetName);

  let values;

  if (defaultValue) {
    if (dataType === 'integer') {
      values = parseInt(defaultValue);
    } else if (dataType === 'real') {
      values = parseFloat(defaultValue);
    } else {
      values = defaultValue;
    }
  }

  if (expression) {
    if (expression === 'uniform_random' || expression === 'random') {
      values = generateUniformRandomData(100);
    } else if (expression === 'normal_random') {
      values = generateNormalDistributionData(100, 0, 1.0);
    } else {
      const replace = [...DUCKDB_AGGREGATE_FUNCTIONS, ...DUCKDB_STATS_FUNCTIONS]
        .map(func => func.name.replace(/\(.*\)/g, ''))
        .join('|');
      const re = new RegExp(`(${replace})\\(([^)]+)\\)`, 'g');
      const updatedCode = expression.replace(re, `(select $1($2) from "${datasetName}")`);
      // execute the SQL expression
      const sql = `SELECT ${updatedCode} FROM "${datasetName}";`;
      const result = await queryValues(sql);
      values = Array.from(result);
    }
  }

  return {
    type: 'createVariable',
    name: functionName,
    result: {
      newColumn: variableName,
      columnType: dataType,
      ...(defaultValue ? {defaultValue} : {}),
      ...(expression ? {expression} : {})
    },
    data: {
      datasetId: keplerDataset?.id,
      datasetName,
      numberOfRows: keplerDataset?.length,
      newColumn: variableName,
      columnType: dataType,
      ...(defaultValue ? {defaultValue} : {}),
      ...(expression ? {expression} : {}),
      values
    }
  };
}
