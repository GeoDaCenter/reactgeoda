import {RatesOptions, calculateRates} from 'geoda-wasm';
import {Select, SelectItem, Selection} from '@nextui-org/react';
import {VariableSelector} from '../common/variable-selector';
import {useState} from 'react';
import {WeightsSelector} from '../weights/weights-management';
import {useSelector} from 'react-redux';
import {GeoDaState} from '@/store';
import {getColumnData, getDataContainer} from '@/utils/data-utils';
import {MAP_ID} from '@/constants';

// Rest of the code...
export type RateValueProps = {
  // call back function to set values in add column panel
  setValues: (values: unknown | unknown[]) => void;
};

export function RateValueComponent({setValues}: RateValueProps) {
  const weights = useSelector((state: GeoDaState) => state.root.weights);
  // use selector to get tableName
  const tableName = useSelector((state: GeoDaState) => state.root.file?.rawFileData?.fileName);
  // use selector to get dataContainer
  const dataContainer = useSelector((state: GeoDaState) =>
    getDataContainer(tableName, state.keplerGl[MAP_ID].visState.datasets)
  );

  const [method, setMethod] = useState(RatesOptions.RawRates);
  const [neighbors, setNeighbors] = useState<number[][] | undefined>(weights?.[0]?.weights);
  const [eventValues, setEventValues] = useState<number[] | null>(null);
  const [baseValues, setBaseValues] = useState<number[] | null>(null);

  const updateValues = (eventValues?: number[], baseValues?: number[], neighbors?: number[][]) => {
    if (eventValues && baseValues && (!method.startsWith('Spatial') || neighbors)) {
      const rateValues = calculateRates({eventValues, baseValues, method, neighbors});
      setValues(rateValues);
    }
  };

  const onEventVariableChange = (variable: string) => {
    // get values from event variable
    const values = getColumnData(variable, dataContainer);
    setEventValues(values);
    if (baseValues && (!method.startsWith('Spatial') || neighbors)) {
      updateValues(values, baseValues, neighbors);
    }
  };

  const onBaseVariableChange = (variable: string) => {
    // get values from base variable
    const values = getColumnData(variable, dataContainer);
    setBaseValues(values);
    if (eventValues && (!method.startsWith('Spatial') || neighbors)) {
      updateValues(eventValues, values, neighbors);
    }
  };

  const onMethodChange = (keys: Selection) => {
    // @ts-expect-error - TS doesn't know that keys is a Selection
    const selectedMethod = keys.currentKey;
    setMethod(selectedMethod);
    if (eventValues && baseValues && neighbors) {
      updateValues(eventValues, baseValues, neighbors);
    }
  };

  // handle weights selection change
  const onWeightsSelectionChange = (id: string) => {
    const selectedW = weights.find(w => w.weightsMeta.id === id);
    if (selectedW) {
      setNeighbors(selectedW.weights);
      if (eventValues && baseValues) {
        updateValues(eventValues, baseValues, selectedW.weights);
      }
    }
  };

  return (
    <div className="flex flex-col gap-1">
      <Select label="Method" size="sm" onSelectionChange={onMethodChange}>
        {Object.values(RatesOptions).map(option => (
          <SelectItem key={option} value={option}>
            {option}
          </SelectItem>
        ))}
      </Select>
      <VariableSelector setVariable={onEventVariableChange} label="Event Variable" size="sm" />
      <VariableSelector setVariable={onBaseVariableChange} label="Base Variable" size="sm" />
      {method.startsWith('Spatial') && (
        <WeightsSelector weights={weights} onSelectWeights={onWeightsSelectionChange} />
      )}
    </div>
  );
}
