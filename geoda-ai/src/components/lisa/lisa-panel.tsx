import {useIntl} from 'react-intl';
import {
  Select,
  SelectItem,
  Autocomplete,
  AutocompleteItem,
  Accordion,
  AccordionItem,
  Spacer,
  Button
} from '@nextui-org/react';
import {useDispatch, useSelector} from 'react-redux';
import {Key, useMemo, useState} from 'react';
import {localMoran} from 'geoda-wasm';
import {ALL_FIELD_TYPES} from '@kepler.gl/constants';
import {Field} from '@kepler.gl/types';
import {KeplerTable} from '@kepler.gl/table';

import {getNumericFieldNames, getColumnDataFromKeplerLayer} from '@/utils/data-utils';
import {GeoDaState} from '@/store';
import {LISA_COLORS, LISA_LABELS, MAP_ID} from '@/constants';
import {RightPanelContainer} from '../common/right-panel-template';
import {WarningBox} from '../common/warning-box';
import {createUniqueValuesMap} from '@/utils/mapping-functions';
import {addTableColumn} from '../../../../../csds_kepler/src/actions/src/vis-state-actions';

const NO_WEIGHTS_MESSAGE = 'Please create a spatial weights matrix before running LISA analysis.';
const NO_MAP_LOADED_MESSAGE = 'Please load a map first before running LISA analysis.';

export function LisaPanel() {
  const intl = useIntl();
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

  // accordion related
  const itemClasses = {
    base: 'py-0 w-full',
    title: 'font-normal text-small',
    indicator: 'text-medium',
    content: 'text-small px-2'
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

  return (
    <RightPanelContainer
      title={intl.formatMessage({
        id: 'lisa.title',
        defaultMessage: 'Local Spatial Autocorrelation'
      })}
      description={intl.formatMessage({
        id: 'lisa.description',
        defaultMessage: 'Apply local spatial autocorrelation analysis'
      })}
    >
      {numericColumns.length === 0 ? (
        <WarningBox message={NO_MAP_LOADED_MESSAGE} type="warning" />
      ) : weights.length === 0 ? (
        <WarningBox message={NO_WEIGHTS_MESSAGE} type="warning" />
      ) : (
        <>
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
          <Accordion className="max-w text-small" itemClasses={itemClasses}>
            <AccordionItem
              key="1"
              aria-label="lisa-parameters"
              title="Parameters"
              className="text-small"
            >
              <Autocomplete
                label="Input number of permutations"
                placeholder="999"
                defaultItems={data}
                className="max-w"
                allowsCustomValue={true}
                onSelectionChange={onPermutationSelectionChange}
                onInputChange={onPermutationInputChange}
              >
                {item => <AutocompleteItem key={item.value}>{item.label}</AutocompleteItem>}
              </Autocomplete>
            </AccordionItem>
          </Accordion>
          <Spacer y={8} />
          <Button radius="sm" color="primary" className="bg-rose-900" onClick={onCreateMap}>
            Run Analysis
          </Button>
        </>
      )}
    </RightPanelContainer>
  );
}
