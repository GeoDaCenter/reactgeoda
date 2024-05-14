// This component will be used to display the classification panel for data or map classification

import {MAP_ID, MappingTypes} from '@/constants';
import {useMemo, useState} from 'react';
import {ColorSelector} from './color-selector';
import {Select, SelectItem, Tab, Tabs} from '@nextui-org/react';
import {ColorRange} from '@kepler.gl/constants';
import {getColumnData, getDataContainer, getLayer, getNumericFieldNames} from '@/utils/data-utils';
import {useSelector} from 'react-redux';
import {GeoDaState} from '@/store';
import {RateValueComponent} from './rate-component';
import {getDefaultColorRange, findColorRange} from '@/utils/color-utils';

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
  method: string;
  variable: string;
  k: number;
  colorRange?: ColorRange;
  rateValues?: number[];
};

export type ClassificationPanelProps = {
  props: {
    k?: number;
    variable?: string;
    mappingType?: string;
  };
  onValuesChange?: ({method, variable, k, colorRange}: ClassificationOnValuesChange) => void;
};

// It will be used in the Map Panel component and Bubble Chart component
export function ClassificationPanel({props, onValuesChange}: ClassificationPanelProps) {
  // useSelector to get layer from redux store
  const layer = useSelector((state: GeoDaState) => getLayer(state));
  // use selector to get tableName
  const tableName = useSelector((state: GeoDaState) => state.root.file?.rawFileData?.fileName);
  // use selector to get dataContainer
  const dataContainer = useSelector((state: GeoDaState) =>
    getDataContainer(tableName, state.keplerGl[MAP_ID].visState.datasets)
  );

  // useState for number of bins
  const [k, setK] = useState(props.k || 5);

  // useState for variable name
  const [variable, setVariable] = useState(props.variable || '');

  // useState for mapping type
  const [mappingType, setMappingType] = useState(props.mappingType || MappingTypes.QUANTILE);

  // useState for selected color range
  const [selectedColorRange, setSelectedColorRange] = useState(getDefaultColorRange(k));

  // get numeric columns from redux store
  const numericColumns = useMemo(() => {
    const fieldNames = getNumericFieldNames(layer);
    return fieldNames;
  }, [layer]);

  // handle map type change
  const onMapTypeChange = (value: any) => {
    const selectValue = value.currentKey;
    setMappingType(selectValue);
    // if user selects unique values, get unique values from the column
    let numberOfCategories = k;
    let updatedColorRange = selectedColorRange;
    if (selectValue === MappingTypes.UNIQUE_VALUES && variable !== '') {
      try {
        // get k value for unique values
        const values = getColumnData(variable, dataContainer);
        // check if values are all integers
        values.forEach((v: number) => {
          if (!Number.isInteger(v)) {
            throw new Error('Values are not all integers');
          }
        });
        const uniqueValues = Array.from(new Set(values)).sort((a, b) => a - b);
        numberOfCategories = uniqueValues.length;
        setK(numberOfCategories);
        // get color range based on k value
        const newColorRange = findColorRange(numberOfCategories, selectedColorRange);
        if (newColorRange) {
          updatedColorRange = newColorRange;
          setSelectedColorRange(newColorRange);
        }
      } catch (e) {
        // error because of undefined column
        setMappingType(MappingTypes.QUANTILE);
      }
    }
    // call onValuesChange callback
    onValuesChange?.({
      method: selectValue,
      variable,
      k: numberOfCategories,
      colorRange: updatedColorRange
    });
  };

  // handle number of bins change
  const onKSelectionChange = (value: any) => {
    const kValue = Number(value.currentKey);
    setK(kValue);
    // get color range based on k value when number of bins change
    const newColorRange = findColorRange(kValue, selectedColorRange);
    setSelectedColorRange(newColorRange);
    onValuesChange?.({method: mappingType, variable, k: kValue, colorRange: newColorRange});
  };

  // handle variable change
  const onVariableSelectionChange = (value: any) => {
    const selectValue = value.currentKey;
    setVariable(selectValue);
    onValuesChange?.({
      method: mappingType,
      variable: selectValue,
      k,
      colorRange: selectedColorRange
    });
  };

  console.log('variable', variable);
  // handle color range selection change
  const onSelectColorRange = (p: ColorRange) => {
    setSelectedColorRange(p);
    onValuesChange?.({method: mappingType, variable, k, colorRange: p});
  };

  // handle rate values change
  const onRateValuesChange = (values: unknown | unknown[], label: string) => {
    if (Array.isArray(values)) {
      onValuesChange?.({
        method: mappingType,
        variable: label,
        k,
        colorRange: selectedColorRange,
        rateValues: values
      });
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <Tabs key="classification-panel-tabs" variant="underlined" aria-label="classification-tabs">
        <Tab key="basic-mapping" title="Basic Mapping">
          <Select
            label="Variable"
            className="max-w"
            onSelectionChange={onVariableSelectionChange}
            selectedKeys={[variable]}
          >
            {numericColumns.map((col: string) => (
              <SelectItem key={col} value={col}>
                {col}
              </SelectItem>
            ))}
          </Select>
        </Tab>
        <Tab key="rate-mapping" title="Rate Mapping">
          <RateValueComponent onValuesChange={onRateValuesChange} />
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
