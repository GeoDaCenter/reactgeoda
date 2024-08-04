// thunk action creators

import {addColumnWithValues} from '@/hooks/use-duckdb';
import {
  spatialAssign,
  SpatialAssignProps,
  spatialCount,
  SpatialCountProps
} from '@/utils/spatial-join-utils';
import {addTableColumn} from '@kepler.gl/actions';
import {Field} from '@kepler.gl/types';
import {Dispatch, UnknownAction} from 'redux';
import {setKeplerTableModal} from './ui-actions';
import {ALL_FIELD_TYPES} from '@kepler.gl/constants';

export enum SPATIAL_JOIN_ACTIONS {
  RUN_SPATIAL_COUNT = 'RUN_SPATIAL_COUNT',
  RUN_SPATIAL_ASSIGN = 'RUN_SPATIAL_ASSIGN'
}

export type SpatialAssignActionPayload = {
  type: 'spatial-assign';
  leftDatasetId: string;
  rightDatasetId: string;
  rightColumnName: string;
  newColumnName: string;
  values?: number[];
  errorMessage?: string;
  status?: 'success' | 'error';
};

export type SpatialCountActionPayload = {
  type: 'spatial-count';
  leftDatasetId: string;
  rightDatasetId: string;
  newColumnName: string;
  values?: number[];
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
  leftTableName: string;
  newColumnName: string;
} & SpatialAssignProps;

export function runSpatialAssignAsync(props: RunSpatialAssignAsyncProps) {
  return async (dispatch: Dispatch<UnknownAction>) => {
    const {
      leftDatasetId,
      leftTableName,
      newColumnName,
      leftLayer,
      rightLayer,
      leftDataset,
      rightDataset,
      rightColumnName
    } = props;

    let values: number[] = [];
    let newField: Field | null = null;
    let errorMessage = '';

    try {
      values = await spatialAssign({
        leftLayer,
        rightLayer,
        leftDataset,
        rightDataset,
        rightColumnName
      });

      // get the original field
      const originalField = rightDataset.fields.find(field => field.name === rightColumnName);
      if (!originalField) {
        throw new Error('Invalid field name from the second dataset.');
      }

      // add new column to duckdb
      // check if values are array of string
      const isStringArray = values.some(v => typeof v === 'string');
      addColumnWithValues({
        tableName: leftTableName,
        columnName: newColumnName,
        columnValues: values,
        columnType: isStringArray ? 'VARCHAR' : 'NUMERIC'
      });

      // add new column to keplergl
      newField = {
        ...originalField,
        id: newColumnName,
        name: newColumnName,
        displayName: newColumnName,
        fieldIdx: leftDataset.fields.length,
        valueAccessor: (d: any) => {
          return leftDataset.dataContainer.valueAt(d.index, leftDataset.fields.length);
        }
      };
    } catch (error) {
      errorMessage = error instanceof Error ? error.message : `${error}`;
    }

    if (newField && errorMessage === '') {
      dispatch(addTableColumn(leftDatasetId, newField, values));
      // show table
      dispatch(setKeplerTableModal(true));
    }
    dispatch(
      runSpatialAssign({
        type: 'spatial-assign',
        leftDatasetId,
        rightDatasetId: rightDataset.id,
        newColumnName,
        errorMessage,
        rightColumnName,
        values,
        status: errorMessage.length > 0 ? 'error' : 'success'
      })
    );
  };
}

export type RunSpatialCountAsyncProps = {
  leftDatasetId: string;
  leftTableName: string;
  newColumnName: string;
} & SpatialCountProps;

export function runSpatialCountAsync(props: RunSpatialCountAsyncProps) {
  return async (dispatch: Dispatch<UnknownAction>) => {
    const {
      leftDatasetId,
      leftTableName,
      newColumnName,
      leftLayer,
      rightLayer,
      leftDataset,
      rightDataset
    } = props;

    let values: number[] = [];
    let newField: Field | null = null;
    let errorMessage = '';

    try {
      values = await spatialCount({
        leftLayer,
        rightLayer,
        leftDataset,
        rightDataset
      });

      // add new column to duckdb
      // check if values are array of string
      addColumnWithValues({
        tableName: leftTableName,
        columnName: newColumnName,
        columnValues: values,
        columnType: 'NUMERIC'
      });

      // add new column to keplergl
      newField = {
        id: newColumnName,
        name: newColumnName,
        displayName: newColumnName,
        format: '',
        type: ALL_FIELD_TYPES.integer,
        analyzerType: 'INTEGER',
        fieldIdx: leftDataset.fields.length,
        valueAccessor: (d: any) => {
          return leftDataset.dataContainer.valueAt(d.index, leftDataset.fields.length);
        }
      };
    } catch (error) {
      errorMessage = error instanceof Error ? error.message : `${error}`;
    }

    if (newField && errorMessage === '') {
      dispatch(addTableColumn(leftDatasetId, newField, values));
      // show table
      dispatch(setKeplerTableModal(true));
    }
    dispatch(
      runSpatialCount({
        type: 'spatial-count',
        leftDatasetId,
        rightDatasetId: rightDataset.id,
        newColumnName,
        errorMessage,
        values,
        status: errorMessage.length > 0 ? 'error' : 'success'
      })
    );
  };
}
