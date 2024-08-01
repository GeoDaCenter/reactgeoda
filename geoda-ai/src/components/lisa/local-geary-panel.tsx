import {Tabs, Tab} from '@nextui-org/react';
import {ALL_FIELD_TYPES} from '@kepler.gl/constants';
import {Field} from '@kepler.gl/types';
import {addLayer, addTableColumn} from '@kepler.gl/actions';
import {useDispatch} from 'react-redux';
import {getColumnDataFromKeplerDataset} from '@/utils/data-utils';
import {localGeary} from 'geoda-wasm';
import {createUniqueValuesMap} from '@/utils/mapping-functions';
import {RunAnalysisProps, UnivariateLisaConfig} from './univariate-lisa-config';
import {useDuckDB} from '@/hooks/use-duckdb';

export function LocalGearyPanel() {
  const dispatch = useDispatch();
  const {addColumnWithValues} = useDuckDB();

  // handle onCreateMap
  const runAnalysis = async ({
    dataset,
    weights,
    selectedWeight,
    variable,
    permValue,
    threshold
  }: RunAnalysisProps) => {
    if (!dataset) return;

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
    const lm = await localGeary({
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
    const newFieldName = `geary_${variable}`;

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
    // Add a new column without data first, so it can avoid error from deduceTypeFromArray()
    dispatch(addTableColumn(dataset.id, newField, clusters));

    // add new column to duckdb
    addColumnWithValues({
      tableName: dataset.label,
      columnName: newFieldName,
      columnType: 'NUMERIC',
      columnValues: clusters
    });

    // create custom scale map
    const newLayer = createUniqueValuesMap({
      dataset,
      uniqueValues: lm.labels.map((_l, i) => i),
      hexColors: lm.colors,
      legendLabels: lm.labels,
      mappingType: 'Local Moran',
      colorFieldName: newFieldName
    });

    // add local moran layer to keper.gl
    dispatch(addLayer(newLayer, dataset.id));
  };

  return (
    <>
      <Tabs aria-label="Options" variant="underlined" color="default" classNames={{}} size="md">
        <Tab
          key="uni-localgeary"
          title={
            <div className="flex items-center space-x-2">
              <span>Univariate</span>
            </div>
          }
        >
          <UnivariateLisaConfig runAnalysis={runAnalysis} />
        </Tab>
        <Tab
          key="multi-localgeary"
          title={
            <div className="flex items-center space-x-2">
              <span>Multivariate</span>
            </div>
          }
        ></Tab>
      </Tabs>
    </>
  );
}
