import {RatesOptions, calculateRates} from 'geoda-wasm';
import {Select, SelectItem, Selection, SharedSelection} from '@nextui-org/react';
import {VariableSelector} from '@/components/common/variable-selector';
import {useState} from 'react';
import {WeightsSelector} from '@/components/weights/weights-selector';
import {useSelector} from 'react-redux';
import {GeoDaState} from '@/store';
import {getColumnDataFromKeplerDataset} from '@/utils/data-utils';
import KeplerTable from '@kepler.gl/table';
import {useDatasetFields} from '@/hooks/use-dataset-fields';

export type RateValueProps = {
  tableName: string;
  keplerDataset: KeplerTable;
  // call back function to handle values and label change
  onValuesChange: (values: unknown | unknown[], label: string) => void;
};

export function RateValueComponent({keplerDataset, onValuesChange}: RateValueProps) {
  const {numericFieldNames} = useDatasetFields(keplerDataset.id);
  const weights = useSelector((state: GeoDaState) => state.root.weights);

  const [method, setMethod] = useState(RatesOptions.RawRates);
  const [neighbors, setNeighbors] = useState<number[][] | undefined>(weights?.[0]?.weights);
  const [eventValues, setEventValues] = useState<number[] | null>(null);
  const [baseValues, setBaseValues] = useState<number[] | null>(null);
  const [eventVariableName, setEventVariableName] = useState<string | undefined>(undefined);
  const [baseVariableName, setBaseVariableName] = useState<string | undefined>(undefined);

  const updateValues = (
    eventVariable?: string,
    eventValues?: number[],
    baseVariable?: string,
    baseValues?: number[],
    neighbors?: number[][]
  ) => {
    if (eventValues && baseValues && (!method.startsWith('Spatial') || neighbors)) {
      const rateValues = calculateRates({eventValues, baseValues, method, neighbors});
      const label = `${method}_${eventVariable}_${baseVariable}`.replace(/\s/g, '_');
      onValuesChange(rateValues, label);
    }
  };

  const onEventVariableChange = (variable: string) => {
    setEventVariableName(variable);
    // get values from event variable
    const values = getColumnDataFromKeplerDataset(variable, keplerDataset);
    setEventValues(values);
    if (baseValues && (!method.startsWith('Spatial') || neighbors)) {
      updateValues(variable, values, baseVariableName, baseValues, neighbors);
    }
  };

  const onBaseVariableChange = (variable: string) => {
    setBaseVariableName(variable);
    // get values from base variable
    const values = getColumnDataFromKeplerDataset(variable, keplerDataset);
    setBaseValues(values);
    if (eventValues && (!method.startsWith('Spatial') || neighbors)) {
      updateValues(eventVariableName, eventValues, variable, values, neighbors);
    }
  };

  const onMethodChange = (keys: Selection) => {
    // @ts-expect-error - TS doesn't know that keys is a Selection
    const selectedMethod = keys.currentKey;
    setMethod(selectedMethod);
    if (eventValues && baseValues && neighbors) {
      updateValues(eventVariableName, eventValues, baseVariableName, baseValues, neighbors);
    }
  };

  // handle weights selection change
  const onWeightsSelectionChange = (value: SharedSelection) => {
    const id = value.currentKey;
    const selectedW = weights.find(w => w.weightsMeta.id === id);
    if (selectedW) {
      setNeighbors(selectedW.weights);
      if (eventValues && baseValues) {
        updateValues(
          eventVariableName,
          eventValues,
          baseVariableName,
          baseValues,
          selectedW.weights
        );
      }
    }
  };

  return (
    <div className="flex flex-col gap-1">
      <Select
        label="Method"
        size="sm"
        onSelectionChange={onMethodChange}
        defaultSelectedKeys={[Object.values(RatesOptions)[0]]}
      >
        {Object.values(RatesOptions).map(option => (
          <SelectItem key={option} value={option}>
            {option}
          </SelectItem>
        ))}
      </Select>

      <VariableSelector
        variables={numericFieldNames}
        defaultVariable={eventVariableName}
        setVariable={onEventVariableChange}
        label="Event Variable"
        size="sm"
      />
      <VariableSelector
        variables={numericFieldNames}
        defaultVariable={baseVariableName}
        setVariable={onBaseVariableChange}
        label="Base Variable"
        size="sm"
      />
      {method.startsWith('Spatial') && (
        <WeightsSelector weights={weights} onSelectWeights={onWeightsSelectionChange} />
      )}
    </div>
  );
}
