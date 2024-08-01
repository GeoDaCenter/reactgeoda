import {Tabs, Tab, Input} from '@nextui-org/react';
import {ALL_FIELD_TYPES} from '@kepler.gl/constants';
import {Field} from '@kepler.gl/types';
import {addLayer, addTableColumn} from '@kepler.gl/actions';
import {useDispatch} from 'react-redux';
import {getColumnDataFromKeplerDataset} from '@/utils/data-utils';
import {quantileLisa} from 'geoda-wasm';
import {createUniqueValuesMap} from '@/utils/mapping-functions';
import {RunAnalysisProps, UnivariateLisaConfig} from './univariate-lisa-config';
import {Key, useState} from 'react';
import {addColumnWithValues} from '@/hooks/use-duckdb';

export function QuantileLisaPanel() {
  const dispatch = useDispatch();

  const [selectedTab, setSelectedTab] = useState('univariate');

  const onSelectionChange = (tab: Key) => {
    setSelectedTab(tab as string);
  };

  const [kValue, setKValue] = useState('5');
  const onKValueChange = (value: string) => {
    setKValue(value);
  };

  const [quantileValue, setQuantileValue] = useState('1');
  const onQuantileValueChange = (value: string) => {
    setQuantileValue(value);
  };

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
    const lm = await quantileLisa({
      k: parseInt(kValue),
      quantile: parseInt(quantileValue),
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
    const newFieldName = `ql_${variable}`;

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
      mappingType: 'Quantile LISA',
      colorFieldName: newFieldName
    });

    // add local moran layer to keper.gl
    dispatch(addLayer(newLayer, dataset.id));
  };

  return (
    <>
      <Tabs
        aria-label="Options"
        variant="underlined"
        color="default"
        classNames={{}}
        size="md"
        onSelectionChange={onSelectionChange}
        selectedKey={selectedTab}
      >
        <Tab
          key="univariate"
          title={
            <div className="flex items-center space-x-2">
              <span>Univariate</span>
            </div>
          }
        >
          <div className="mb-4 flex flex-col gap-4">
            <Input
              label="Enter number of quantiles"
              type="number"
              onValueChange={onKValueChange}
              value={kValue}
            />
            <Input
              label="Enter which quantile to use"
              type="number"
              onValueChange={onQuantileValueChange}
              value={quantileValue}
            />
          </div>
          <UnivariateLisaConfig runAnalysis={runAnalysis} />
        </Tab>
      </Tabs>
    </>
  );
}
