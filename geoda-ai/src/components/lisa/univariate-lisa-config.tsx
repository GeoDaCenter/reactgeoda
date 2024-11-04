import {
  Autocomplete,
  AutocompleteItem,
  Accordion,
  AccordionItem,
  SharedSelection
} from '@nextui-org/react';
import {Key, useState} from 'react';
import {accordionItemClasses} from '@/constants';
import {useSelector} from 'react-redux';
import {CreateButton} from '../common/create-button';
import {selectWeightsByDataId} from '@/store/selectors';
import KeplerTable from '@kepler.gl/table';
import {DatasetSelector} from '../common/dataset-selector';
import {WeightsSelector} from '../weights/weights-management';
import {VariableSelector} from '../common/variable-selector';
import {useDatasetFields} from '@/hooks/use-dataset-fields';
import {WeightsProps} from '@/reducers/weights-reducer';

export type RunAnalysisProps = {
  dataset: KeplerTable;
  weights: WeightsProps[];
  selectedWeight: string;
  variable: string;
  permValue: string;
  threshold: string;
};

export type UnivariateLisaConfigProps = {
  runAnalysis: (props: RunAnalysisProps) => void;
};

export function UnivariateLisaConfig({runAnalysis}: UnivariateLisaConfigProps) {
  const {datasetId, numericFieldNames, keplerDataset} = useDatasetFields();
  const [selectedDatasetId, setSelectedDatasetId] = useState(datasetId);

  const [isRunning, setIsRunning] = useState(false);
  // useState for variable name
  const [variable, setVariable] = useState('');

  const weights = useSelector(selectWeightsByDataId(datasetId));
  const [weightsId, setWeightsId] = useState<string>(
    weights.length > 0 ? weights[weights.length - 1].weightsMeta.id || '' : ''
  );

  // handle select weights
  const onSelectWeights = (value: SharedSelection) => {
    const id = value.currentKey;
    if (id) {
      setWeightsId(id);
    }
  };

  // handle onCreateMap
  const onCreateMap = async () => {
    setIsRunning(true);
    // wait for 0.1s to show loading spinner
    await new Promise(resolve => setTimeout(resolve, 100));
    await runAnalysis({
      dataset: keplerDataset,
      weights,
      selectedWeight: weightsId,
      variable,
      permValue,
      threshold
    });
    setIsRunning(false);
  };

  const data = [
    {label: '999', value: '999'},
    {label: '9999', value: '9999'},
    {label: '99999', value: '99999'}
  ];
  const [permValue, setPermValue] = useState<string>('');
  const [, setSelectedPermKey] = useState<Key | null>(null);

  const onPermutationSelectionChange = (key: Key | null) => {
    if (!key) return;
    setSelectedPermKey(key);
    setPermValue(key as string);
  };

  const onPermutationInputChange = (value: string) => {
    setPermValue(value);
  };

  const [threshold, setThreshold] = useState<string>('');
  const [, setSelectedThresholdKey] = useState<Key | null>(null);

  const onThresholdSelectionChange = (key: Key | null) => {
    if (!key) return;
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
    <div className="flex flex-col gap-4">
      <DatasetSelector datasetId={selectedDatasetId} setDatasetId={setSelectedDatasetId} />
      <VariableSelector variables={numericFieldNames} setVariable={setVariable} size="sm" />
      <WeightsSelector weights={weights} weightsId={weightsId} onSelectWeights={onSelectWeights} />
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
      <CreateButton
        isRunning={isRunning}
        onClick={onCreateMap}
        isDisabled={variable === '' || weightsId === ''}
      >
        Run Analysis
      </CreateButton>
    </div>
  );
}
