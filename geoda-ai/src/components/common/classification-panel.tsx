import {MappingTypes} from '@/constants';
import {ColorSelector} from './color-selector';
import {Select, SelectItem, Tab, Tabs} from '@nextui-org/react';
import {ColorRange} from '@kepler.gl/constants';
import {RateUIComponent, RateUIProps} from './rate-component';
import {findColorRange} from '@/utils/color-utils';
import {
  DatasetVariableSelector,
  onDatasetVariableSelectionChangeProps
} from './dataset-variable-selector';
import {RatesOptions} from 'geoda-wasm';
import {Key} from 'react';

export const ClassificationTypes = [
  {
    label: 'Quantile',
    value: MappingTypes.QUANTILE
  },
  {
    label: 'Natural Breaks',
    value: MappingTypes.NATURAL_BREAK
  },
  {
    label: 'Equal Interval',
    value: MappingTypes.EQUAL_INTERVAL
  },
  {
    label: 'Percentile',
    value: MappingTypes.PERCENTILE
  },
  {
    label: 'Box (Hinge=1.5)',
    value: MappingTypes.BOX_MAP_15
  },
  {
    label: 'Box (Hinge=3.0)',
    value: MappingTypes.BOX_MAP_30
  },
  {
    label: 'Standard Deviation',
    value: MappingTypes.STD_MAP
  },
  {
    label: 'Unique Values',
    value: MappingTypes.UNIQUE_VALUES
  },
  {
    label: 'Co-location',
    value: MappingTypes.COLOCATION,
    disabled: true
  }
];

// create an array from 2 to 20
const DefaultNumberOfCategories = Array.from({length: 19}, (_, i) => i + 2).map(i => ({
  label: `${i}`,
  value: i
}));

export type ClassificationOnValuesChange = {
  datasetId: string;
  method: MappingTypes;
  k: number;
  variable?: string;
  eventVariable?: string;
  baseVariable?: string;
  ratesMethod?: RatesOptions;
  weightsId?: string;
  colorRange?: ColorRange;
};

export type ClassificationPanelProps = {
  props: {
    k: number;
    setK: (k: number) => void;
    variable: string;
    setVariable: (variable: string) => void;
    mappingType: MappingTypes;
    setMappingType: (mappingType: MappingTypes) => void;
    selectedColorRange: ColorRange;
    setSelectedColorRange: (colorRange: ColorRange) => void;
    setIsRatesMap?: (isRatesMap: boolean) => void;
  } & RateUIProps['props'];
};

// It will be used in the Map Panel component and Bubble Chart component
export function ClassificationPanel({props}: ClassificationPanelProps) {
  const {
    k,
    setK,
    datasetId,
    setDatasetId,
    variable,
    setVariable,
    mappingType,
    setMappingType,
    eventVariable,
    setEventVariable,
    baseVariable,
    setBaseVariable,
    weightsId,
    setWeightsId,
    ratesMethod,
    setRatesMethod,
    selectedColorRange,
    setSelectedColorRange,
    setIsRatesMap
  } = props;

  // handle map type change
  const onMapTypeChange = (value: any) => {
    const selectValue = value.currentKey;
    setMappingType(selectValue);
  };

  // handle number of bins change
  const onKSelectionChange = (value: any) => {
    const kValue = Number(value.currentKey);
    setK(kValue);
    // get color range based on k value when number of bins change
    const newColorRange = findColorRange(kValue, selectedColorRange);
    setSelectedColorRange(newColorRange);
  };

  // handle color range selection change
  const onSelectColorRange = (p: ColorRange) => {
    setSelectedColorRange(p);
  };

  const onDatasetVariableSelectionChange = ({
    variable,
    dataId
  }: onDatasetVariableSelectionChangeProps) => {
    setVariable(variable || '');
    setDatasetId(dataId || '');
  };

  const onSelectionChange = (key: Key) => {
    setIsRatesMap?.(key === 'rate-mapping');
  };

  return (
    <div className="flex flex-col gap-2">
      <Tabs
        key="classification-panel-tabs"
        variant="underlined"
        aria-label="classification-tabs"
        onSelectionChange={onSelectionChange}
      >
        <Tab key="basic-mapping" title="Basic Mapping">
          <DatasetVariableSelector
            datasetId={datasetId}
            setDatasetId={setDatasetId}
            variable={variable}
            setVariable={setVariable}
            onSelectionChange={onDatasetVariableSelectionChange}
          />
        </Tab>
        <Tab key="rate-mapping" title="Rate Mapping">
          <RateUIComponent
            props={{
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
            }}
          />
        </Tab>
      </Tabs>
      <Select
        label="Classification Method"
        className="max-w"
        onSelectionChange={onMapTypeChange}
        selectedKeys={[mappingType]}
        disabledKeys={ClassificationTypes.filter(t => t.disabled).map(t => t.value)}
      >
        {ClassificationTypes.map(mappingType => (
          <SelectItem key={mappingType.value} value={mappingType.value}>
            {mappingType.label}
          </SelectItem>
        ))}
      </Select>
      <Select
        label="Number of Categories"
        className="max-w"
        onSelectionChange={onKSelectionChange}
        selectedKeys={[`${k}`]}
      >
        {DefaultNumberOfCategories.map(bin => (
          <SelectItem key={bin.value} value={bin.value}>
            {bin.label}
          </SelectItem>
        ))}
      </Select>
      <ColorSelector
        numberOfColors={k}
        defaultColorRange={selectedColorRange?.name}
        onSelectColorRange={onSelectColorRange}
      />
    </div>
  );
}
