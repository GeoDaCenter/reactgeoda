// This component will be used to display the classification panel for data or map classification

import {MappingTypes} from '@/constants';
import {useMemo, useState} from 'react';
import {ColorSelector, getDefaultColorRange} from './color-selector';
import {Select, SelectItem} from '@nextui-org/react';
import {ColorRange} from '@kepler.gl/constants';
import {getLayer, getNumericFieldNames} from '@/utils/data-utils';
import {useSelector} from 'react-redux';
import {GeoDaState} from '@/store';

export const ClassificationTypes = [
  {
    label: 'Quantile Map',
    value: MappingTypes.QUANTILE
  },
  {
    label: 'Natural Breaks Map',
    value: MappingTypes.NATURAL_BREAK
  },
  {
    label: 'Equal Interval Map',
    value: MappingTypes.EQUAL_INTERVAL
  },
  {
    label: 'Percentile Map',
    value: MappingTypes.PERCENTILE
  },
  {
    label: 'Box Map (Hinge=1.5)',
    value: MappingTypes.BOX_MAP_15
  },
  {
    label: 'Box Map (Hinge=3.0)',
    value: MappingTypes.BOX_MAP_30
  },
  {
    label: 'Standard Deviation Map',
    value: MappingTypes.STD_MAP
  },
  {
    label: 'Unique Values Map',
    value: MappingTypes.UNIQUE_VALUES
  },
  {
    label: 'Co-location Map',
    value: MappingTypes.COLOCATION
  },
  {
    label: 'Raw Rate Map',
    value: MappingTypes.RAW_RATE
  },
  {
    label: 'Excess Rate Map',
    value: MappingTypes.EXCESS_RATE
  },
  {
    label: 'Empirical Bayes Map',
    value: MappingTypes.EB_MAP
  },
  {
    label: 'Spatial Rate Map',
    value: MappingTypes.SPATIAL_RATE
  },
  {
    label: 'Spatial Empirical Bayes Map',
    value: MappingTypes.SPATIAL_EB_MAP
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
};

export type ClassificationPanelProps = {
  onValuesChange?: ({method, variable, k, colorRange}: ClassificationOnValuesChange) => void;
};

// It will be used in the Map Panel component and Bubble Chart component
export function ClassificationPanel({onValuesChange}: ClassificationPanelProps) {
  // useState for number of bins
  const [k, setK] = useState(5);

  // useState for variable name
  const [variable, setVariable] = useState('');

  // useState for mapping type
  const [mappingType, setMappingType] = useState(MappingTypes.QUANTILE);

  // useState for selected color range
  const [selectedColorRange, setSelectedColorRange] = useState(getDefaultColorRange(k));

  // useSelector to get layer from redux store
  const layer = useSelector((state: GeoDaState) => getLayer(state));

  // get numeric columns from redux store
  const numericColumns = useMemo(() => {
    const fieldNames = getNumericFieldNames(layer);
    return fieldNames;
  }, [layer]);

  // handle map type change
  const onMapTypeChange = (value: any) => {
    const selectValue = value.currentKey;
    setMappingType(selectValue);
    onValuesChange?.({method: selectValue, variable, k, colorRange: selectedColorRange});
  };

  // handle number of bins change
  const onKSelectionChange = (value: any) => {
    const kValue = Number(value.currentKey);
    setK(kValue);
    onValuesChange?.({method: mappingType, variable, k: kValue, colorRange: selectedColorRange});
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

  // handle color range selection change
  const onSelectColorRange = (p: ColorRange) => {
    setSelectedColorRange(p);
    onValuesChange?.({method: mappingType, variable, k, colorRange: p});
  };

  return (
    <div className="flex flex-col gap-2">
      <Select
        label="Classification Method"
        className="max-w"
        onSelectionChange={onMapTypeChange}
        defaultSelectedKeys={[mappingType]}
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
        defaultSelectedKeys={[`${k}`]}
      >
        {DefaultNumberOfCategories.map(bin => (
          <SelectItem key={bin.value} value={bin.value}>
            {bin.label}
          </SelectItem>
        ))}
      </Select>
      <Select label="Variable" className="max-w" onSelectionChange={onVariableSelectionChange}>
        {numericColumns.map((col: string) => (
          <SelectItem key={col} value={col}>
            {col}
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
