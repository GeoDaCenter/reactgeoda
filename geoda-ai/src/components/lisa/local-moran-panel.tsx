import {
  Select,
  SelectItem,
  Autocomplete,
  AutocompleteItem,
  Accordion,
  AccordionItem,
  Spacer,
  Button,
  Tabs,
  Tab
} from '@nextui-org/react';
import {Key, useMemo, useState} from 'react';
import {ALL_FIELD_TYPES} from '@kepler.gl/constants';
import {Field} from '@kepler.gl/types';
import {KeplerTable} from '@kepler.gl/table';
import {addTableColumn} from '@kepler.gl/actions';
import {LISA_COLORS, LISA_LABELS, MAP_ID} from '@/constants';
import {useDispatch, useSelector} from 'react-redux';
import {GeoDaState} from '@/store';
import {getColumnDataFromKeplerLayer, getNumericFieldNames} from '@/utils/data-utils';
import {localMoran} from 'geoda-wasm';
import {createUniqueValuesMap} from '@/utils/mapping-functions';

// accordion related
export const accordionItemClasses = {
  base: 'py-0 w-full m-0',
  title: 'font-normal text-small',
  indicator: 'text-medium',
  content: 'text-small px-0'
};

export function LocalMoranPanel() {
  const dispatch = useDispatch();

  const geodaState = useSelector((state: GeoDaState) => state);
  const tableName = useSelector((state: GeoDaState) => state.root.file?.rawFileData?.name);
  const weights = useSelector((state: GeoDaState) => state.root.weights);

  // useState for variable name
  const [variable, setVariable] = useState('');
  const [selectedWeight, setSelectedWeight] = useState<string>(
    weights.length > 0 ? weights[weights.length - 1].weightsMeta.id || '' : ''
  );

  // get numeric columns from redux store
  const numericColumns = useMemo(() => {
    const fieldNames = getNumericFieldNames(tableName, geodaState.keplerGl[MAP_ID].visState);
    return fieldNames;
  }, [geodaState.keplerGl, tableName]);

  // handle variable change
  const onVariableSelectionChange = (value: any) => {
    const selectValue = value.currentKey;
    setVariable(selectValue);
  };

  // handle select weights
  const onSelectWeights = (value: any) => {
    const selectValue = value.currentKey;
    setSelectedWeight(selectValue);
  };

  // handle onCreateMap
  const onCreateMap = async () => {
    if (!tableName) return;

    // get selected weight
    const selectedWeightData = weights.find(({weightsMeta}) => weightsMeta.id === selectedWeight);
    if (!selectedWeightData) {
      console.error('Selected weight not found');
      return;
    }

    // get column data from dataContainer
    const columnData = getColumnDataFromKeplerLayer(
      tableName,
      variable,
      geodaState.keplerGl[MAP_ID].visState
    );

    // get permutation input
    const permutations = parseFloat(permValue) || 999;

    // get significant cutoff input
    const sigCutoff = 0.05;

    // run LISA analysis
    const lm = await localMoran(columnData, selectedWeightData?.weights, permutations);

    // get cluster values using significant cutoff
    const clusters = lm.pValues.map((p: number, i) => {
      if (p > sigCutoff) {
        return 0;
      }
      return lm.clusters[i];
    });

    // add new column to kepler.gl
    const newFieldName = `lm_${variable}`;

    // get dataset from kepler.gl if dataset.label === tableName
    const datasets: KeplerTable[] = Object.values(geodaState.keplerGl[MAP_ID].visState.datasets);
    const dataset = datasets.find(dataset => dataset.label === tableName);
    if (!dataset) {
      console.error('Dataset not found');
      return;
    }
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
      uniqueValues: [0, 1, 2, 3, 4, 5],
      hexColors: LISA_COLORS,
      legendLabels: LISA_LABELS,
      mappingType: 'Local Moran',
      colorFieldName: newFieldName,
      dispatch,
      geodaState
    });
  };

  const data = [
    {label: '999', value: '999'},
    {label: '9999', value: '9999'},
    {label: '99999', value: '99999'}
  ];
  const [permValue, setPermValue] = useState<string>('');
  const [, setSelectedPermKey] = useState<Key | null>(null);

  const onPermutationSelectionChange = (key: Key) => {
    setSelectedPermKey(key);
    setPermValue(key as string);
  };

  const onPermutationInputChange = (value: string) => {
    setPermValue(value);
  };

  const defaultThresholds = [
    {label: '0.05', value: '0.05'},
    {label: '0.01', value: '0.01'},
    {label: '0.001', value: '0.001'}
  ];

  return (
    <>
      <Tabs aria-label="Options" variant="solid" color="warning" classNames={{}} size="md">
        <Tab
          key="uni-localmoran"
          title={
            <div className="flex items-center space-x-2">
              <span>Univariate</span>
            </div>
          }
        >
          <Select
            label="Select Variable"
            className="max-w mb-6"
            onSelectionChange={onVariableSelectionChange}
          >
            {numericColumns.map((col: string) => (
              <SelectItem key={col} value={col}>
                {col}
              </SelectItem>
            ))}
          </Select>
          <Select
            label="Select Spatial Weights"
            className="max-w mb-6"
            onSelectionChange={onSelectWeights}
            selectedKeys={[selectedWeight ?? weights[weights.length - 1].weightsMeta.id ?? '']}
          >
            {weights.map(({weightsMeta}, i) => (
              <SelectItem key={weightsMeta.id ?? i} value={weightsMeta.id}>
                {weightsMeta.id}
              </SelectItem>
            ))}
          </Select>
          <Accordion
            className="w-full px-0.5 text-small shadow-none"
            variant="light"
            itemClasses={accordionItemClasses}
          >
            <AccordionItem
              key="1"
              aria-label="lisa-parameters"
              title="Parameters"
              className="w-full text-small"
            >
              <div className="mb-2 flex flex-col gap-3">
                <Autocomplete
                  label="Input number of permutations"
                  placeholder="999"
                  defaultItems={data}
                  className="w-full"
                  allowsCustomValue={true}
                  onSelectionChange={onPermutationSelectionChange}
                  onInputChange={onPermutationInputChange}
                >
                  {item => <AutocompleteItem key={item.value}>{item.label}</AutocompleteItem>}
                </Autocomplete>
                <Autocomplete
                  label="Input threshold cutoff"
                  placeholder="0.05"
                  defaultItems={defaultThresholds}
                  className="w-full"
                  allowsCustomValue={true}
                  onSelectionChange={onPermutationSelectionChange}
                  onInputChange={onPermutationInputChange}
                >
                  {item => <AutocompleteItem key={item.value}>{item.label}</AutocompleteItem>}
                </Autocomplete>
              </div>
            </AccordionItem>
          </Accordion>
          <Spacer y={8} />
          <Button
            radius="sm"
            color="primary"
            className="max-w mb-4 bg-rose-900"
            onClick={onCreateMap}
          >
            Run Analysis
          </Button>
        </Tab>
        <Tab
          key="bi-localmoran"
          title={
            <div className="flex items-center space-x-2">
              <span>Bivariate</span>
            </div>
          }
        ></Tab>
        <Tab
          key="diff-localmoran"
          title={
            <div className="flex items-center space-x-2">
              <span>Differential</span>
            </div>
          }
        ></Tab>
      </Tabs>
    </>
  );
}
