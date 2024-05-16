import {DUCKDB_AGGREGATE_FUNCTIONS, DUCKDB_STATS_FUNCTIONS} from '@/components/table/sql-constant';
import {generateNormalDistributionData, generateUniformRandomData} from '@/utils/table-utils';

export type CreateVariableCallBackProps = {
  tableName: string;
  variableName: string;
  dataType: string;
  defaultValue?: string;
  expression?: string;
};

export type CreateVariableCallBackOutput = {
  type: 'createVariable';
  name: string;
  result: {
    newColumn: string;
    columnType: string;
    defaultValue?: string;
    expression?: string;
  };
  data: {
    newColumn: string;
    columnType: string;
    defaultValue?: string;
    expression?: string;
    values: unknown | unknown[];
  };
};

export async function createVariableCallBack(
  {variableName, dataType, defaultValue, expression}: CreateVariableCallBackProps,
  {
    tableName,
    queryValues
  }: {
    tableName: string;
    queryValues: (sql: string) => Promise<unknown[]>;
  }
): Promise<CreateVariableCallBackOutput> {
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
      const updatedCode = expression.replace(re, `(select $1($2) from "${tableName}")`);
      // execute the SQL expression
      const sql = `SELECT ${updatedCode} FROM "${tableName}";`;
      const result = await queryValues(sql);
      values = Array.from(result);
    }
  }

  return {
    type: 'createVariable',
    name: 'Create Cariable',
    result: {
      newColumn: variableName,
      columnType: dataType,
      ...(defaultValue ? {defaultValue} : {}),
      ...(expression ? {expression} : {})
    },
    data: {
      newColumn: variableName,
      columnType: dataType,
      ...(defaultValue ? {defaultValue} : {}),
      ...(expression ? {expression} : {}),
      values
    }
  };
}
