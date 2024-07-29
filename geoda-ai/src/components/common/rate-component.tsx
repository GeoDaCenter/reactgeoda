import {RatesOptions} from 'geoda-wasm';
import {Select, SelectItem, Selection} from '@nextui-org/react';
import {VariableSelector} from './variable-selector';
import {WeightsSelector} from '../weights/weights-management';
import {useSelector} from 'react-redux';
import {GeoDaState} from '@/store';
import {DatasetSelector} from './dataset-selector';

export type RateUIProps = {
  props: {
    ratesMethod: RatesOptions;
    setRatesMethod: (ratesMethod: RatesOptions) => void;
    datasetId: string;
    setDatasetId: (datasetId: string) => void;
    eventVariable: string;
    setEventVariable: (eventVariable: string) => void;
    baseVariable: string;
    setBaseVariable: (baseVariable: string) => void;
    weightsId: string;
    setWeightsId: (weightsId: string) => void;
  };
};

export function RateUIComponent({props}: RateUIProps) {
  const {
    ratesMethod,
    setRatesMethod,
    datasetId,
    setDatasetId,
    eventVariable,
    setEventVariable,
    baseVariable,
    setBaseVariable,
    weightsId,
    setWeightsId
  } = props;

  const weights = useSelector((state: GeoDaState) => state.root.weights);

  const onEventVariableChange = (variable: string) => {
    setEventVariable(variable);
  };

  const onBaseVariableChange = (variable: string) => {
    setBaseVariable(variable);
  };

  const onMethodChange = (keys: Selection) => {
    // @ts-expect-error - TS doesn't know that keys is a Selection
    const selectedMethod = keys.currentKey;
    setRatesMethod(selectedMethod);
  };

  // handle weights selection change
  const onWeightsSelectionChange = (id: string) => {
    setWeightsId(id);
  };

  const onDatasetIdSelect = (datasetId: string) => {
    // set datasetId
    setDatasetId(datasetId);
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
      <DatasetSelector datasetId={datasetId} setDatasetId={onDatasetIdSelect} />
      <VariableSelector
        dataId={datasetId}
        setVariable={onEventVariableChange}
        label="Event Variable"
        size="sm"
        defaultVariable={eventVariable}
      />
      <VariableSelector
        dataId={datasetId}
        setVariable={onBaseVariableChange}
        label="Base Variable"
        size="sm"
        defaultVariable={baseVariable}
      />
      {ratesMethod.startsWith('Spatial') && (
        <WeightsSelector
          weights={weights}
          weightsId={weightsId}
          onSelectWeights={onWeightsSelectionChange}
        />
      )}
    </div>
  );
}
