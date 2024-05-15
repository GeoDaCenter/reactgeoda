import KeplerTable from '@kepler.gl/table';
import {defaultOperators, Field as QueryField} from 'react-querybuilder';
import MerseeneTwister from 'mersenne-twister';
// @ts-ignore
import {DATA_TYPES} from 'type-analyzer';
import {DEFAULT_RANDOM_SEED} from '@/constants';
import {Field} from '@kepler.gl/types';
import {Dispatch, UnknownAction} from 'redux';
import {addTableColumn} from '@kepler.gl/actions';

export function getQueryBuilderFields(dataset: KeplerTable | undefined) {
  const fields: QueryField[] = [];

  dataset?.fields.forEach(field => {
    if (field.type === 'string') {
      const uniqueValues = new Set<string>();
      for (let i = 0; i < dataset.length; i++) {
        uniqueValues.add(dataset.getValue(field.name, i));
      }
      // convert unique values to array
      const uniqueValuesArray = Array.from(uniqueValues);
      const values = uniqueValuesArray.map(value => ({label: value, name: value}));
      fields.push({
        name: field.name,
        label: field.name,
        valueEditorType: 'select',
        operators: defaultOperators.filter(op => op.name === '='),
        values
      });
    }
    fields.push({name: field.name, label: field.name});
  });
  return fields;
}

export function validateColumnName(columnName: string) {
  // column name has to follow the duckdb rules
  // https://duckdb.org/docs/sql/overview
  // use regex to validate the column name
  // return true if valid, false if invalid
  const columnNameRegex = /^[a-zA-Z_][a-zA-Z0-9_]*$/;
  return columnNameRegex.test(columnName);
}

export function validateDefaultValue(defaultValue: string, columnType: string) {
  // validate the default value based on the column type
  // return true if valid, false if invalid
  if (columnType === 'INTEGER') {
    return !isNaN(parseInt(defaultValue));
  } else if (columnType === 'REAL') {
    return !isNaN(parseFloat(defaultValue));
  }
  return true;
}

export function validataColumnType(columnType: string) {
  // validate the column type
  // return true if valid, false if invalid
  return ['integer', 'real', 'string', 'bool'].includes(columnType);
}

/**
 * Convert the field type used by kepler.gl to the analyzer type used by type-analyzer
 * @param fieldType The field type kepler.gl uses
 * @returns The analyzer type used by type-analyzer
 */
export function fieldTypeToAnalyzerType(fieldType: string): DATA_TYPES {
  const analyzerType =
    fieldType === 'integer'
      ? DATA_TYPES.INTEGER
      : fieldType === 'real'
        ? DATA_TYPES.REAL
        : DATA_TYPES.STRING;

  return analyzerType;
}

/**
 * Generate column data with the default value
 * @param numberOfRows The number of rows to generate
 * @param defaultValue The default value to use
 * @returns The generated column data
 */
export function generateColumnData(numberOfRows: number, defaultValue: unknown | unknown[]) {
  if (Array.isArray(defaultValue)) {
    return defaultValue;
  }
  const data: unknown[] = [];
  for (let i = 0; i < numberOfRows; ++i) {
    data.push(defaultValue);
  }
  return data;
}

export type generateSQLCreateNewColumnProps = {
  tableName: string;
  columnName: string;
  columnType: string;
};

export function generateSQLCreateNewColumn({
  tableName,
  columnName,
  columnType
}: generateSQLCreateNewColumnProps) {
  const sqlColumnType = mapColumnTypeToSQL(columnType);
  // generate the SQL query to create a new column
  const sql = `ALTER TABLE "${tableName}" \nADD COLUMN ${columnName} ${sqlColumnType};`;
  return sql;
}

export function mapColumnTypeToSQL(columnType: string) {
  // map the column type to the SQL type in duckdb
  // return the SQL type
  switch (columnType) {
    case 'integer':
      return 'INTEGER';
    case 'real':
      return 'REAL';
    case 'string':
      return 'TEXT';
    default:
      return 'TEXT';
  }
}

export function ThomasWangHashDouble(key: number) {
  key = ~key + (key << 21);
  key = key ^ (key >> 24);
  key = key + (key << 3) + (key << 8);
  key = key ^ (key >> 14);
  key = key + (key << 2) + (key << 4);
  key = key ^ (key >> 28);
  key = key + (key << 31);
  return 5.42101086242752217e-20 * key;
}

export function generateUniformRandomData(numberOfRows: number, seed?: number) {
  // generate random values between 0 and 1 using a uniform distribution and seed
  const mt = new MerseeneTwister(seed || DEFAULT_RANDOM_SEED);
  const values = Array.from({length: numberOfRows}, () => mt.random());
  return values;
}

export function generateNormalDistributionData(
  numberOfRows: number,
  mean: number,
  sd: number,
  seed?: number
) {
  const mt = new MerseeneTwister(seed || DEFAULT_RANDOM_SEED);
  const data = [];
  for (let i = 0; i < numberOfRows; i++) {
    let u = 0;
    let v = 0;
    while (u === 0) u = mt.random(); // Converting [0,1) to (0,1)
    while (v === 0) v = mt.random();
    const z = mean + sd * Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
    data.push(z);
  }
  return data;
}

export function getDefaultValues(
  numberOfRows: number,
  columnType: string,
  defaultValue: string,
  defaultValueOption: string
) {
  let updatedDefaultValue = undefined;
  let updatedValues = undefined;

  if (columnType === 'string') {
    updatedDefaultValue = defaultValue ? `'${defaultValue}'` : undefined;
  } else if (columnType === 'integer') {
    updatedDefaultValue = defaultValue ? parseInt(defaultValue) : undefined;
    if (defaultValueOption === 'enumerate') {
      updatedValues = [...Array(numberOfRows).keys()];
    }
  } else if (columnType === 'real') {
    updatedDefaultValue = defaultValue ? parseFloat(defaultValue) : undefined;
    if (defaultValueOption === 'uniform_random') {
      // generate random values between 0 and 1 using a uniform distribution and seed
      const mt = new MerseeneTwister(DEFAULT_RANDOM_SEED);
      updatedValues = Array.from({length: numberOfRows}, () => mt.random());
    } else if (defaultValueOption === 'normal_random') {
      // generate random values using random gaussian distribution with mean = 0, sd = 1.0
      updatedValues = generateNormalDistributionData(numberOfRows, 0, 1.0, DEFAULT_RANDOM_SEED);
    }
  }

  return {
    defaultValue: updatedDefaultValue,
    values: updatedValues
  };
}

export type generateSQLUpdateColumnProps = {
  tableName: string;
  columnName: string;
  columnType: string;
  defaultValue?: string;
  values?: unknown | unknown[];
};

export function generateSQLUpdateColumn({
  tableName,
  columnName,
  columnType,
  values
}: generateSQLUpdateColumnProps) {
  const sqlColumnType = mapColumnTypeToSQL(columnType);
  // check if values is default value
  let defaultValue = null;
  if (!Array.isArray(values)) {
    defaultValue = columnType === 'string' ? `"${values}"` : values;
  }
  // generate the SQL query to create a new column
  let sql = `ALTER TABLE "${tableName}" \nADD COLUMN ${columnName} ${sqlColumnType}`;
  if (defaultValue) {
    sql = `${sql}\nDEFAULT ${defaultValue}`;
  }
  if (Array.isArray(values) && values.length > 0) {
    // use 'with' clause to add values to the new column
    // const valuesVec = vectorFromArray(values);
    // // create a sequence starting from 0
    // const seqVec = vectorFromArray([...Array(values.length).keys()]);
    // // create a table from the vectors
    // const arrowTable = new ArrowTable({ row_index: seqVec, values: valuesVec });
    // update SQL
    // const updateSQL = `UPDATE "${tableName}" SET ${columnName} = arrowTable.values FROM arrowTable WHERE arrowTable.row_index = "${tableName}".row_index`;
    const valuesString = values.join(',');
    const sequenceSQL = 'CREATE SEQUENCE serial';
    const updateSQL = `UPDATE "${tableName}" \nSET ${columnName} = tmp.values \nFROM (\n SELECT\n  nextval('serial')-1 AS row_index,\n  UNNEST([${valuesString}]) AS values\n) AS tmp \nWHERE "${tableName}".row_index = tmp.row_index`;
    sql = `${sql}; \n\n${sequenceSQL}; \n\n${updateSQL}`;
  }
  return `${sql};`;
}

export type addKeplerColumnProps = {
  dataset?: KeplerTable;
  newFieldName: string;
  fieldType: string;
  columnData: unknown | unknown[];
  dispatch: Dispatch<UnknownAction>;
};

/**
 * Add a new column to kepler.gl
 */
export function addKeplerColumn({
  dataset,
  newFieldName,
  fieldType,
  columnData,
  dispatch
}: addKeplerColumnProps) {
  if (dataset) {
    // get dataset from kepler.gl if dataset.label === tableName
    const dataContainer = dataset.dataContainer;
    const fieldsLength = dataset.fields.length;
    // get analyzer type from columnType
    const analyzerType = fieldTypeToAnalyzerType(fieldType);
    const numberOfRows = dataset.length;

    // add new column to kepler.gl
    const newField: Field = {
      id: newFieldName,
      name: newFieldName,
      displayName: newFieldName,
      format: '',
      type: fieldType,
      analyzerType,
      fieldIdx: fieldsLength,
      valueAccessor: (d: any) => {
        return dataContainer?.valueAt(d.index, fieldsLength);
      }
    };

    const values = generateColumnData(numberOfRows, columnData);
    // Add a new column without data first, so it can avoid error from deduceTypeFromArray()
    dispatch(addTableColumn(dataset.id, newField, values));
  }
}
