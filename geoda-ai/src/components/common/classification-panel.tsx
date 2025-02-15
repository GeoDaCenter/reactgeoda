import {MappingTypes} from '@/constants';
import {ColorSelector} from './color-selector';
import {Select, SelectItem, SharedSelection, Spacer, Tab, Tabs} from '@nextui-org/react';
import {ColorRange} from '@kepler.gl/constants';
import {RateUIComponent, RateUIProps} from './rate-component';
import {
  findColorRange,
  getColorRanges,
  getDefaultColorRange,
  MAX_COLOR_RANGE_LENGTH
} from '@/utils/color-utils';
import {RatesOptions} from 'geoda-wasm';
import {Key, useMemo, useState} from 'react';
import {useDispatch} from 'react-redux';
import {CreateButton} from './create-button';
import {createMapAsync, createRatesMapAsync} from '@/actions';
import {getColumnDataFromKeplerDataset} from '@/utils/data-utils';
import {DatasetSelector} from './dataset-selector';
import {useDatasetFields} from '@/hooks/use-dataset-fields';
import {VariableSelector} from './variable-selector';

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
export function ClassificationPanel() {
  const dispatch = useDispatch<any>();

  const {datasetId, numericFieldNames, keplerDataset} = useDatasetFields();
  const [selectedDatasetId, setSelectedDatasetId] = useState(datasetId);

  // handle classification config changes
  const [isRatesMap, setIsRatesMap] = useState(false);
  const [k, setK] = useState(5);
  const [numberOfUniqueValues, setNumberOfUniqueValues] = useState(5);
  const [variable, setVariable] = useState('');
  const [baseVariable, setBaseVariable] = useState('');
  const [eventVariable, setEventVariable] = useState('');
  const [weightsId, setWeightsId] = useState('');
  const [mappingType, setMappingType] = useState(MappingTypes.QUANTILE);
  const [selectedColorRange, setSelectedColorRange] = useState(getDefaultColorRange(k));
  const [ratesMethod, setRatesMethod] = useState(RatesOptions.RawRates);
  const [selectedColorType, setSelectedColorType] = useState('');

  const isCreateButtonDisabled = useMemo(() => {
    if (isRatesMap) {
      return !baseVariable || !eventVariable || !mappingType || k <= 0;
    }
    return !variable || !mappingType || k <= 0;
  }, [isRatesMap, baseVariable, eventVariable, variable, mappingType, k]);

  // handle map type change
  const onMapTypeChange = (value: SharedSelection) => {
    const selectValue = value.currentKey as MappingTypes;
    setMappingType(selectValue);
    // set color type to 'qualitative' when mapping type is 'Unique Values'
    setSelectedColorType('');
    setSelectedColorRange(getDefaultColorRange(k));
    if (selectValue === MappingTypes.UNIQUE_VALUES) {
      // get number of colors based on unique values of the variable
      const columnData = getColumnDataFromKeplerDataset(variable, keplerDataset);
      const uniqueValues = new Set(columnData);
      const uniqueValuesCount = Math.min(uniqueValues.size, MAX_COLOR_RANGE_LENGTH);
      setNumberOfUniqueValues(uniqueValuesCount);
      setSelectedColorType('qualitative');
      setSelectedColorRange(getColorRanges(uniqueValuesCount, 'qualitative')[0]);
    }
  };

  // handle number of bins change
  const onKSelectionChange = (value: SharedSelection) => {
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

  const onSelectionChange = (key: Key) => {
    setIsRatesMap?.(key === 'rate-mapping');
  };

  // handle onCreateMap
  const onCreateMap = async () => {
    if (!selectedDatasetId) {
      return;
    }
    const numberOfColors = mappingType === MappingTypes.UNIQUE_VALUES ? numberOfUniqueValues : k;

    if (isRatesMap === false) {
      dispatch(
        createMapAsync({
          dataId: selectedDatasetId,
          variable,
          classficationMethod: mappingType,
          numberOfCategories: numberOfColors,
          colorRange: selectedColorRange
        })
      );
    } else if (
      eventVariable &&
      baseVariable &&
      eventVariable.length > 0 &&
      baseVariable.length > 0 &&
      ratesMethod &&
      ratesMethod.length > 0
    ) {
      dispatch(
        createRatesMapAsync({
          dataId: selectedDatasetId,
          method: ratesMethod,
          eventVariable,
          baseVariable,
          classficationMethod: mappingType,
          numberOfCategories: numberOfColors,
          colorRange: selectedColorRange,
          weightsId
        })
      );
    }
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
          <div className="flex flex-col gap-1">
            <DatasetSelector
              datasetId={selectedDatasetId}
              setDatasetId={setSelectedDatasetId}
              size="sm"
            />
            <VariableSelector variables={numericFieldNames} setVariable={setVariable} />
          </div>
        </Tab>
        <Tab key="rate-mapping" title="Rate Mapping">
          <RateUIComponent
            props={{
              ratesMethod,
              setRatesMethod,
              datasetId: selectedDatasetId,
              setDatasetId: setSelectedDatasetId,
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
        disallowEmptySelection={true}
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
      {mappingType !== MappingTypes.UNIQUE_VALUES && (
        <Select
          label="Number of Categories"
          disallowEmptySelection={true}
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
      )}
      <ColorSelector
        numberOfColors={mappingType !== MappingTypes.UNIQUE_VALUES ? k : numberOfUniqueValues}
        colorType={selectedColorType}
        defaultColorRange={selectedColorRange?.name}
        onSelectColorRange={onSelectColorRange}
      />
      <Spacer y={2} />
      <CreateButton onClick={onCreateMap} isDisabled={isCreateButtonDisabled}>
        Create a New Map Layer
      </CreateButton>
    </div>
  );
}
