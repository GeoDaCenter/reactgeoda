import {LocalMoranResult} from 'geoda-wasm';
import {Field} from '@kepler.gl/types';
import {ALL_FIELD_TYPES} from '@kepler.gl/constants';
import {KeplerTable} from '@kepler.gl/table';
import {WeightsProps} from '@/actions';
import {getColumnDataFromKeplerDataset} from './data-utils';

type RunLocalMoranProps = {
  type: 'moran' | 'geary' | 'g' | 'gstar';
  dataset: KeplerTable;
  weights: WeightsProps[];
  selectedWeight: string;
  variable: string;
  permValue: string;
  threshold: string;
  lisaFunction: (props: any) => Promise<LocalMoranResult>;
};

export async function runLisa({
  type,
  dataset,
  weights,
  selectedWeight,
  variable,
  permValue,
  threshold,
  lisaFunction
}: RunLocalMoranProps) {
  if (!dataset) {
    throw new Error('Dataset not found');
  }

  // get selected weight
  const selectedWeightData = weights.find(({weightsMeta}) => weightsMeta.id === selectedWeight);
  if (!selectedWeightData) {
    throw new Error('Selected weight not found');
  }

  // get column data from dataContainer
  const columnData = getColumnDataFromKeplerDataset(variable, dataset);

  // get permutation input
  const permutations = parseFloat(permValue) || 999;

  // get significant cutoff input
  const sigCutoff = parseFloat(threshold) || 0.05;

  // run LISA analysis
  const lm: LocalMoranResult = await lisaFunction({
    data: columnData,
    neighbors: selectedWeightData?.weights,
    permutation: permutations,
    significanceCutoff: sigCutoff
  });

  // get cluster values using significant cutoff
  const clusters = lm.pValues.map((p: number, i) => {
    if (p > sigCutoff) {
      return 0;
    }
    return lm.clusters[i];
  });

  // add new column to kepler.gl
  const newFieldName = `${type}_${variable}`;

  // get dataset from kepler.gl if dataset.label === tableName

  const dataContainer = dataset.dataContainer;
  const fieldsLength = dataset.fields.length;

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

  return {newField, values: clusters};
}
