import {RunAnalysisProps} from '@/components/lisa/univariate-lisa-config';
import {addColumnWithValues} from '@/hooks/use-duckdb';
import {runLisa, runQuantileLisa} from '@/utils/lisa-functions';
import {createUniqueValuesMap} from '@/utils/mapping-functions';
import {addLayer, addTableColumn} from '@kepler.gl/actions';
import {LocalMoranResult} from 'geoda-wasm';
import {Dispatch} from 'react';
import {UnknownAction} from 'redux';

export type RunLisaAsyncProps = {
  type: string;
  layerLabel: string;
  lisaFunction: (props: any) => Promise<LocalMoranResult>;
} & RunAnalysisProps;

// thunk action creators
export function runLisaAsync(payload: RunLisaAsyncProps) {
  return async (dispatch: Dispatch<UnknownAction>) => {
    const {dataset, type, variable, layerLabel} = payload;
    const newFieldName = `${type}_${variable}`;
    const {newField, values, lisaLabels, lisaColors} = await runLisa(payload);

    // Add a new column without data first, so it can avoid error from deduceTypeFromArray()
    dispatch(addTableColumn(dataset.id, newField, values));

    // add new column to duckdb
    await addColumnWithValues({
      tableName: dataset.label,
      columnName: newFieldName,
      columnType: 'NUMERIC',
      columnValues: values
    });

    // create custom scale map
    const newLayer = createUniqueValuesMap({
      dataset,
      uniqueValues: lisaLabels.map((_l, i) => i),
      hexColors: lisaColors,
      legendLabels: lisaLabels,
      mappingType: layerLabel,
      colorFieldName: newFieldName
    });

    // add new layer to keper.gl
    dispatch(addLayer(newLayer, dataset.id));
  };
}

export type RunQuantileLisaAsyncProps = {
  type: string;
  layerLabel: string;
  k: number;
  quantile: number;
} & RunAnalysisProps;

export function runQuantileLisaAsync(payload: RunQuantileLisaAsyncProps) {
  return async (dispatch: Dispatch<UnknownAction>) => {
    const {dataset, type, variable, layerLabel} = payload;
    const newFieldName = `${type}_${variable}`;
    const {newField, values, lisaLabels, lisaColors} = await runQuantileLisa(payload);

    // Add a new column without data first, so it can avoid error from deduceTypeFromArray()
    dispatch(addTableColumn(dataset.id, newField, values));

    // add new column to duckdb
    await addColumnWithValues({
      tableName: dataset.label,
      columnName: newFieldName,
      columnType: 'NUMERIC',
      columnValues: values
    });

    // create custom scale map
    const newLayer = createUniqueValuesMap({
      dataset,
      uniqueValues: lisaLabels.map((_l, i) => i),
      hexColors: lisaColors,
      legendLabels: lisaLabels,
      mappingType: layerLabel,
      colorFieldName: newFieldName
    });

    // add new layer to keper.gl
    dispatch(addLayer(newLayer, dataset.id));
  };
}
