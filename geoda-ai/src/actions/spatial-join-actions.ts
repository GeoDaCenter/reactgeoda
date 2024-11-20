// thunk action creators

import {DuckDB} from '@/hooks/use-duckdb';
import {spatialCount, spatialJoinUtil} from '@/utils/spatial-join-utils';
import {addTableColumn} from '@kepler.gl/actions';
import {Field} from '@kepler.gl/types';
import {Dispatch, UnknownAction} from 'redux';
import {setKeplerTableModal} from './ui-actions';
import {ALL_FIELD_TYPES} from '@kepler.gl/constants';
import {GeoDaState} from '@/store';
import {
  getColumnDataFromKeplerDataset,
  getDatasetName,
  getKeplerLayer,
  getKeplerTable
} from '@/utils/data-utils';
import {MAP_ID} from '@/constants';
import {applyOperation} from '@/utils/join-table-utils';

export enum SPATIAL_JOIN_ACTIONS {
  RUN_SPATIAL_COUNT = 'RUN_SPATIAL_COUNT',
  RUN_SPATIAL_ASSIGN = 'RUN_SPATIAL_ASSIGN'
}

export type AssignVariable = {
  variableName: string;
  variableType: string;
  newVariableName: string;
};

export type SpatialAssignActionPayload = {
  type: 'spatial-assign';
  leftDatasetId: string;
  rightDatasetId: string;
  assignVariables: Array<AssignVariable>;
  errorMessage?: string;
  status?: 'success' | 'error';
};

type CountVariable = {
  variableName: string;
  operation: string;
  newVariableName: string;
};

export type SpatialCountActionPayload = {
  type: 'spatial-count';
  leftDatasetId: string;
  rightDatasetId: string;
  joinVariables: Array<CountVariable>;
  errorMessage?: string;
  status?: 'success' | 'error';
};

// action creators
export const runSpatialAssign = (payload: SpatialAssignActionPayload) => ({
  type: SPATIAL_JOIN_ACTIONS.RUN_SPATIAL_ASSIGN,
  payload
});

export const runSpatialCount = (payload: SpatialCountActionPayload) => ({
  type: SPATIAL_JOIN_ACTIONS.RUN_SPATIAL_COUNT,
  payload
});

// thunk action creators
export type RunSpatialAssignAsyncProps = {
  leftDatasetId: string;
  rightDatasetId: string;
  assignVariables: Array<AssignVariable>;
};

export function runSpatialAssignAsync(props: RunSpatialAssignAsyncProps) {
  return async (dispatch: Dispatch<UnknownAction>, getState: () => GeoDaState) => {
    const {leftDatasetId, rightDatasetId, assignVariables} = props;

    const datasets = getState().root.datasets;
    const visState = getState().keplerGl[MAP_ID].visState;

    const leftTableName = getDatasetName(datasets, leftDatasetId);
    const leftLayer = getKeplerLayer(leftTableName, visState);
    const leftDataset = getKeplerTable(leftTableName, visState);

    const rightTableName = getDatasetName(datasets, rightDatasetId);
    const rightLayer = getKeplerLayer(rightTableName, visState);
    const rightDataset = getKeplerTable(rightTableName, visState);

    if (!leftLayer || !rightLayer || !leftDataset || !rightDataset) {
      throw new Error('Invalid layer.');
    }

    let joinResult: number[][] = [];
    let newField: Field | null = null;
    let errorMessage = '';

    try {
      joinResult = await spatialJoinUtil({
        leftLayer,
        rightLayer,
        leftDataset,
        rightDataset
      });

      assignVariables.forEach(variable => {
        const {variableName, newVariableName} = variable;
        // get the original field
        const originalField = rightDataset.fields.find(field => field.name === variableName);
        if (!originalField) {
          throw new Error('Invalid field name from the second dataset.');
        }
        const originalValues = getColumnDataFromKeplerDataset(variableName, rightDataset);
        // get assigned values
        const assignedValues = joinResult.map(row =>
          row.length > 0 ? originalValues[row[0]] : null
        );

        // add new column to duckdb
        // check if values are array of string
        const isStringArray = assignedValues.some(v => typeof v === 'string');

        DuckDB.getInstance().addColumnWithValues({
          tableName: leftTableName,
          columnName: newVariableName,
          columnValues: assignedValues,
          columnType: isStringArray ? 'VARCHAR' : 'NUMERIC'
        });

        // add new column to keplergl
        newField = {
          ...originalField,
          id: newVariableName,
          name: newVariableName,
          displayName: newVariableName,
          fieldIdx: leftDataset.fields.length,
          valueAccessor: (d: any) => {
            return leftDataset.dataContainer.valueAt(d.index, leftDataset.fields.length);
          }
        };
        if (newField && errorMessage === '') {
          dispatch(addTableColumn(leftDatasetId, newField, assignedValues));
          // show table
          dispatch(setKeplerTableModal(true));
        }
      });
    } catch (error) {
      errorMessage = error instanceof Error ? error.message : `${error}`;
    }
    dispatch(
      runSpatialAssign({
        type: 'spatial-assign',
        leftDatasetId,
        rightDatasetId: rightDataset.id,
        assignVariables,
        errorMessage,
        status: errorMessage.length > 0 ? 'error' : 'success'
      })
    );
  };
}

export type RunSpatialCountAsyncProps = {
  leftDatasetId: string;
  rightDatasetId: string;
  joinVariables: Array<{variableName: string; operation: string; newVariableName: string}>;
};

export function runSpatialCountAsync(props: RunSpatialCountAsyncProps) {
  return async (dispatch: Dispatch<UnknownAction>, getState: () => GeoDaState) => {
    const {leftDatasetId, rightDatasetId, joinVariables} = props;

    const datasets = getState().root.datasets;
    const visState = getState().keplerGl[MAP_ID].visState;

    const leftTableName = getDatasetName(datasets, leftDatasetId);
    const leftLayer = getKeplerLayer(leftTableName, visState);
    const leftDataset = getKeplerTable(leftTableName, visState);

    const rightTableName = getDatasetName(datasets, rightDatasetId);
    const rightLayer = getKeplerLayer(rightTableName, visState);
    const rightDataset = getKeplerTable(rightTableName, visState);

    if (!leftLayer || !rightLayer || !leftDataset || !rightDataset) {
      throw new Error('Invalid layer.');
    }

    let joinResult: number[][] = [];
    let newField: Field | null = null;
    let errorMessage = '';

    try {
      joinResult = await spatialCount({
        leftLayer,
        rightLayer,
        leftDataset,
        rightDataset
      });

      joinVariables.forEach(variable => {
        const {variableName, operation, newVariableName} = variable;
        // get values of variableName from rightDataset
        const originalValues = getColumnDataFromKeplerDataset(variableName, rightDataset);
        // apply operation to originalValues
        const joinedValues = applyOperation(joinResult, originalValues, operation);
        // sanitize joinedValues
        const sanitizedValues = joinedValues.map(v => (Number.isNaN(v) ? null : v));
        // check if values are array of string
        const isStringArray = sanitizedValues.some(v => typeof v === 'string');
        // check if values are array of float
        const isFloatArray = sanitizedValues.some(v => Number.isFinite(v) && !Number.isInteger(v));

        // add new column to leftDataset in duckdb
        // check if values are array of string
        DuckDB.getInstance().addColumnWithValues({
          tableName: leftTableName,
          columnName: newVariableName,
          columnValues: sanitizedValues,
          columnType: isStringArray ? 'VARCHAR' : 'NUMERIC'
        });

        // determine the field type
        const fieldType = isStringArray
          ? ALL_FIELD_TYPES.string
          : isFloatArray
            ? ALL_FIELD_TYPES.real
            : ALL_FIELD_TYPES.integer;

        // determine the analyzer type
        const analyzerType = isStringArray ? 'STRING' : isFloatArray ? 'REAL' : 'INTEGER';

        // add new column to keplergl
        newField = {
          id: newVariableName,
          name: newVariableName,
          displayName: newVariableName,
          format: '',
          type: fieldType,
          analyzerType: analyzerType,
          fieldIdx: leftDataset.fields.length,
          valueAccessor: (d: any) => {
            return leftDataset.dataContainer.valueAt(d.index, leftDataset.fields.length);
          }
        };
        if (newField && errorMessage === '') {
          // add new column to keplergl
          dispatch(addTableColumn(leftDatasetId, newField, sanitizedValues));
          // show table
          dispatch(setKeplerTableModal(true));
        }
      });
    } catch (error) {
      errorMessage = error instanceof Error ? error.message : `${error}`;
    }
    dispatch(
      runSpatialCount({
        type: 'spatial-count',
        leftDatasetId,
        rightDatasetId: rightDataset.id,
        joinVariables,
        errorMessage,
        status: errorMessage.length > 0 ? 'error' : 'success'
      })
    );
  };
}
