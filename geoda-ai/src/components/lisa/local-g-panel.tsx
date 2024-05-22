import {Tabs, Tab} from '@nextui-org/react';
import {ALL_FIELD_TYPES} from '@kepler.gl/constants';
import {Field} from '@kepler.gl/types';
import {addTableColumn} from '@kepler.gl/actions';
import {useDispatch} from 'react-redux';
import {getColumnData} from '@/utils/data-utils';
import {localG} from 'geoda-wasm';
import {createUniqueValuesMap} from '@/utils/mapping-functions';
import {RunAnalysisProps, UnivariateLisaConfig} from './univariate-lisa-config';
import {Key, useState} from 'react';

export function LocalGPanel() {
  const dispatch = useDispatch();

  const [selectedTab, setSelectedTab] = useState('uni-localg');

  const onSelectionChange = (tab: Key) => {
    setSelectedTab(tab as string);
  };

  // handle onCreateMap
  const runLocalG = async ({
    tableName,
    dataset,
    weights,
    selectedWeight,
    variable,
    permValue,
    threshold,
    layer,
    layerOrder
  }: RunAnalysisProps) => {
    if (!tableName || !dataset) return;

    // get selected weight
    const selectedWeightData = weights.find(({weightsMeta}) => weightsMeta.id === selectedWeight);
    if (!selectedWeightData) {
      console.error('Selected weight not found');
      return;
    }

    // get column data from dataContainer
    const columnData = getColumnData(variable, dataset.dataContainer);

    // get permutation input
    const permutations = parseFloat(permValue) || 999;

    // get significant cutoff input
    const sigCutoff = parseFloat(threshold) || 0.05;

    // run LISA analysis
    const lm = await localG({
      data: columnData,
      neighbors: selectedWeightData?.weights,
      permutation: permutations,
      significanceCutoff: sigCutoff,
      isGStar: selectedTab === 'uni-localgstart'
    });

    // get cluster values using significant cutoff
    const clusters = lm.pValues.map((p: number, i) => {
      if (p > sigCutoff) {
        return 0;
      }
      return lm.clusters[i];
    });

    // add new column to kepler.gl
    const newFieldName = `g_${variable}`;

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

    // create custom scale map
    createUniqueValuesMap({
      uniqueValues: lm.labels.map((_l, i) => i),
      hexColors: lm.colors,
      legendLabels: lm.labels,
      mappingType: selectedTab === 'uni-localgstart' ? 'Local G*' : 'Local G',
      colorFieldName: newFieldName,
      dispatch,
      layer,
      layerOrder
    });
  };

  return (
    <>
      <Tabs
        aria-label="Options"
        variant="solid"
        color="warning"
        classNames={{}}
        size="md"
        onSelectionChange={onSelectionChange}
        selectedKey={selectedTab}
      >
        <Tab
          key="uni-localg"
          title={
            <div className="flex items-center space-x-2">
              <span>Getis-Ord G</span>
            </div>
          }
        >
          <UnivariateLisaConfig runAnalysis={runLocalG} />
        </Tab>
        <Tab
          key="uni-localgstart"
          title={
            <div className="flex items-center space-x-2">
              <span>Getis-Ord G*</span>
            </div>
          }
        >
          <UnivariateLisaConfig runAnalysis={runLocalG} />
        </Tab>
      </Tabs>
    </>
  );
}
