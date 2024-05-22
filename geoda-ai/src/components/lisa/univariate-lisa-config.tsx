import {
  Select,
  SelectItem,
  Autocomplete,
  AutocompleteItem,
  Accordion,
  AccordionItem,
  Spacer
} from '@nextui-org/react';
import {Key, useMemo, useState} from 'react';
import {MAP_ID, accordionItemClasses} from '@/constants';
import {useSelector} from 'react-redux';
import {GeoDaState} from '@/store';
import {getDataset, getLayer, getNumericFieldNames} from '@/utils/data-utils';
import {CreateButton} from '../common/create-button';

export type RunAnalysisProps = {
  tableName: string;
  dataset: any;
  weights: any[];
  selectedWeight: string;
  variable: string;
  permValue: string;
  threshold: string;
  layer: any;
  layerOrder: any[];
};

export type UnivariateLisaConfigProps = {
  runAnalysis: (props: RunAnalysisProps) => void;
};

export function UnivariateLisaConfig({runAnalysis}: UnivariateLisaConfigProps) {
  const tableName = useSelector((state: GeoDaState) => state.root.file?.rawFileData?.fileName);
  const weights = useSelector((state: GeoDaState) => state.root.weights);
  const layer = useSelector((state: GeoDaState) => getLayer(state));
  const dataset = useSelector((state: GeoDaState) => getDataset(state));
  const layerOrder =
    useSelector((state: GeoDaState) => state.keplerGl[MAP_ID].visState.layerOrder) || [];

  // useState for variable name
  const [variable, setVariable] = useState('');
  const [selectedWeight, setSelectedWeight] = useState<string>(
    weights.length > 0 ? weights[weights.length - 1].weightsMeta.id || '' : ''
  );

  // get numeric columns from redux store
  const numericColumns = useMemo(() => {
    const fieldNames = getNumericFieldNames(layer);
    return fieldNames;
  }, [layer]);

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
    await runAnalysis({
      tableName,
      dataset,
      weights,
      selectedWeight,
      variable,
      permValue,
      threshold,
      layer,
      layerOrder
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

  const [threshold, setThreshold] = useState<string>('');
  const [, setSelectedThresholdKey] = useState<Key | null>(null);

  const onThresholdSelectionChange = (key: Key) => {
    setSelectedThresholdKey(key);
    setThreshold(key as string);
  };

  const onThresholdInputChange = (value: string) => {
    setThreshold(value);
  };

  const defaultThresholds = [
    {label: '0.05', value: '0.05'},
    {label: '0.01', value: '0.01'},
    {label: '0.001', value: '0.001'}
  ];

  return (
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
              onSelectionChange={onThresholdSelectionChange}
              onInputChange={onThresholdInputChange}
            >
              {item => <AutocompleteItem key={item.value}>{item.label}</AutocompleteItem>}
            </Autocomplete>
          </div>
        </AccordionItem>
      </Accordion>
      <Spacer y={8} />
      <CreateButton onClick={onCreateMap} isDisabled={variable === '' || selectedWeight === ''}>
        Run Analysis
      </CreateButton>
    </>
  );
}
