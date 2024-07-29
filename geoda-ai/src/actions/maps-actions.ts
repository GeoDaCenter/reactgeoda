import {MAP_ID, MappingTypes} from '@/constants';
import {addColumnWithValues} from '@/hooks/use-duckdb';
import {createMapUpdater, createRatesMapUpdater} from '@/reducers/maps-updater';
import {GeoDaState} from '@/store';
import {addKeplerColumn} from '@/utils/table-utils';
import {addLayer, addTableColumn} from '@kepler.gl/actions';
import {ColorRange} from '@kepler.gl/constants';
import {RatesOptions} from 'geoda-wasm';
import {Dispatch} from 'react';
import {UnknownAction} from 'redux';

// action types
export enum MAPS_ACTIONS {
  CREATE_MAP = 'CREATE_MAP',
  CREATE_RATES_MAP = 'CREATE_RATES_MAP'
}

// action payload
export type CreateMapPayloadProps = {
  dataId: string;
  variable: string;
  classficationMethod: (typeof MappingTypes)[keyof typeof MappingTypes];
  numberOfCategories: number;
  colorRange: ColorRange;
};

export type CreateRatesMapPayloadProps = {
  dataId: string;
  method: RatesOptions;
  eventVariable: string;
  baseVariable: string;
  classficationMethod: (typeof MappingTypes)[keyof typeof MappingTypes];
  numberOfCategories: number;
  colorRange: ColorRange;
  weightsId?: string;
};

// action creators
export const createMap = (payload: CreateMapPayloadProps) => ({
  type: MAPS_ACTIONS.CREATE_MAP,
  payload
});

// thunk action creators
export function createMapAsync(payload: CreateMapPayloadProps) {
  return async (dispatch: Dispatch<UnknownAction>, getState: () => GeoDaState) => {
    const newKeplerLayer = await createMapUpdater(payload, getState().keplerGl);
    if (newKeplerLayer) {
      dispatch(addLayer(newKeplerLayer, newKeplerLayer.config.dataId));
    }
  };
}

export function createRatesMapAsync(payload: CreateRatesMapPayloadProps) {
  return async (dispatch: Dispatch<UnknownAction>, getState: () => GeoDaState) => {
    const weights = getState().root.weights;
    const {newLayer, values: columnValues} = await createRatesMapUpdater(
      payload,
      getState().keplerGl,
      weights
    );
    const keplerDataset = getState().keplerGl[MAP_ID].visState.datasets[payload.dataId];
    if (newLayer) {
      // add new column to duckdb
      await addColumnWithValues({
        tableName: keplerDataset.label,
        columnName: newLayer.config.colorField.name,
        columnValues: columnValues,
        columnType: 'NUMERIC'
      });
      // add new column to kepler
      const {newField, values: columnData} = await addKeplerColumn({
        dataset: keplerDataset,
        newFieldName: newLayer.config.colorField.name,
        fieldType: 'real',
        columnData: columnValues
      });
      // Add a new column without data first, so it can avoid error from deduceTypeFromArray()
      dispatch(addTableColumn(keplerDataset.id, newField, columnData));
      // add new layer to kepler
      dispatch(addLayer(newLayer, newLayer.config.dataId));
    }
  };
}
