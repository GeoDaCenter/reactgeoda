import {LocalMoranResultType, localMoran} from 'geoda-wasm';
import {Dispatch} from 'react';
import {Field} from '@kepler.gl/types';
import {ALL_FIELD_TYPES} from '@kepler.gl/constants';
import {KeplerTable} from '@kepler.gl/table';
import {addTableColumn} from '@kepler.gl/actions';

type RunLocalMoranProps = {
  data: number[];
  weights: number[][];
  significanceThreshold: number;
  permutations: number;
  newFieldName: string;
  keplerDataset: KeplerTable;
  dispatch?: Dispatch<unknown>;
};

export async function runLocalMoran({
  data,
  weights,
  significanceThreshold,
  permutations,
  newFieldName,
  keplerDataset,
  dispatch
}: RunLocalMoranProps) {
  // add local moran results to kepler.gl table
  // run LISA analysis
  const lm: LocalMoranResultType = await localMoran(data, weights, permutations);

  // get cluster values using significant cutoff
  const clusters = lm.pValues.map((p: number, i) => {
    if (p > significanceThreshold) {
      return 0;
    }
    return lm.clusters[i];
  });

  if (dispatch) {
    const dataContainer = keplerDataset.dataContainer;
    const fieldsLength = keplerDataset.fields.length;

    // create new field
    const newField: Field = {
      id: newFieldName,
      name: newFieldName,
      displayName: newFieldName,
      format: '',
      type: ALL_FIELD_TYPES.real,
      analyzerType: 'FLOAT',
      fieldIdx: fieldsLength,
      valueAccessor: (d: any) => {
        return dataContainer.valueAt(d.index, fieldsLength);
      }
    };
    // Add a new column without data first, so it can avoid error from deduceTypeFromArray()
    dispatch(addTableColumn(keplerDataset.id, newField, clusters));
  }
}
