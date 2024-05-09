import {RatesOptions, calculateRates} from 'geoda-wasm';
import {Select, SelectItem, Selection} from '@nextui-org/react';
import {VariableSelector} from '../common/variable-selector';
import {useState} from 'react';
import {WeightsSelector} from '../weights/weights-management';
import {useSelector} from 'react-redux';
import {GeoDaState} from '@/store';
import {getColumnData, getDataContainer} from '@/utils/data-utils';
import {MAP_ID} from '@/constants';

export type RateValueProps = {
  // call back function to set values in add column panel
  setValues: (values: unknown | unknown[], label: string) => void;
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
      const label = `${method}_${eventVariable}_${baseVariable}`;
      setValues(rateValues, label);
    }
  };

  const onEventVariableChange = (variable: string) => {
    setEventVariableName(variable);
    // get values from event variable
    const values = getColumnData(variable, dataContainer);
    setEventValues(values);
    if (baseValues && (!method.startsWith('Spatial') || neighbors)) {
      updateValues(variable, values, baseVariableName, baseValues, neighbors);
    }
  };

  const onBaseVariableChange = (variable: string) => {
    setBaseVariableName(variable);
    // get values from base variable
    const values = getColumnData(variable, dataContainer);
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
  const onWeightsSelectionChange = (id: string) => {
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
      <VariableSelector setVariable={onEventVariableChange} label="Event Variable" size="sm" />
      <VariableSelector setVariable={onBaseVariableChange} label="Base Variable" size="sm" />
      {method.startsWith('Spatial') && (
        <WeightsSelector weights={weights} onSelectWeights={onWeightsSelectionChange} />
      )}
    </div>
  );
}
