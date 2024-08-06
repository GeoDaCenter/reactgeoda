import {DUCKDB_AGGREGATE_FUNCTIONS, DUCKDB_STATS_FUNCTIONS} from '@/components/table/sql-constant';
import {generateNormalDistributionData, generateUniformRandomData} from '@/utils/table-utils';
import {createErrorResult, ErrorOutput} from '../custom-functions';
import {CHAT_DATASET_NOT_FOUND} from '@/constants';
import {CustomFunctionOutputProps} from '@/ai/openai-utils';
import {VisState} from '@kepler.gl/schemas';

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
  CreateVariableResult,
  CreateVariableData
> & {
  type: 'createVariable';
  data: CreateVariableData;
};

type CreateVariableCallBackProps = {
  tableName: string;
  variableName: string;
  dataType: string;
  defaultValue?: string;
  expression?: string;
  datasetName?: string;
};

export async function createVariableCallBack(
  functionName: string,
  {variableName, dataType, defaultValue, expression, datasetName}: CreateVariableCallBackProps,
  {visState, queryValues}: {visState: VisState; queryValues: (sql: string) => Promise<unknown[]>}
): Promise<CreateVariableCallbackOutput | ErrorOutput> {
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
