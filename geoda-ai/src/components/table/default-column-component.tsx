import {Input, Autocomplete, AutocompleteItem} from '@nextui-org/react';
import {Key, useMemo, useState} from 'react';
import {generateNormalDistributionData, generateUniformRandomData} from '@/utils/table-utils';

const DEFAULT_VALUE_OPTIONS = [
  {
    label: 'Uniform Random',
    value: 'uniform_random',
    description: 'Random uniform dist on unit interval'
  },
  {
    label: 'Normal Random',
    value: 'normal_random',
    description: 'Random Gaussian dist with mean and standard deviation'
  },
  {label: 'Enumerate', value: 'enumerate', description: 'enumerate as 1, 2, 3, ...'}
];

// Add default value component to get default value/values for the new column
export function DefaultValueComponent({
  numberOfRows,
  columnType,
  setValues
}: {
  numberOfRows: number;
  columnType: string;
  setValues: (values: unknown | unknown[]) => void;
}) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [defaultValue, setDefaultValue] = useState('');
  const [defaultValueOption, setDefaultValueOption] = useState('');
  const [meanValue, setMeanValue] = useState(0);
  const [stdValue, setStdValue] = useState(1);

  const selectedDefaultValueOptions = useMemo(() => {
    if (columnType === 'real') {
      return DEFAULT_VALUE_OPTIONS.slice(0, 2);
    } else if (columnType === 'integer') {
      return [DEFAULT_VALUE_OPTIONS[2]];
    }
    return [];
  }, [columnType]);

  // when user types default value
  const onDefaultValueChange = (value: string) => {
    // use continuePropagation()
    setDefaultValue(value);
    if (columnType === 'integer') {
      setValues(parseInt(value));
    } else if (columnType === 'real') {
      setValues(parseFloat(value));
    } else {
      setValues(value);
    }
  };

  // when default value selection changes
  const onDefaultValueSelectionChange = (value: Key) => {
    const defaultOption = value as string;
    setDefaultValueOption(defaultOption);
    if (defaultOption === 'uniform_random') {
      // generate random values between 0 and 1 using a uniform distribution and seed
      const values = generateUniformRandomData(numberOfRows);
      setValues(values);
    } else if (defaultOption === 'normal_random') {
      // generate random values using random gaussian distribution with mean and sd
      const values = generateNormalDistributionData(numberOfRows, meanValue, stdValue);
      setValues(values);
    }
  };

  // when mean value changes
  const onMeanValueChange = (value: string) => {
    let val = 0;
    try {
      val = parseFloat(value);
    } catch (e) {
      val = 0;
    }
    setMeanValue(val);
    // compute values based on mean and std deviation
    const values = generateNormalDistributionData(numberOfRows, val, stdValue);
    setValues(values);
  };

  // when std value changes
  const onStdValueChange = (value: string) => {
    let val = 0;
    try {
      val = parseFloat(value);
    } catch (e) {
      val = 0;
    }
    setStdValue(val);
    // compute values based on mean and std deviation
    const values = generateNormalDistributionData(numberOfRows, val, stdValue);
    setValues(values);
  };

  return (
    <div className="flex flex-col gap-1">
      <Autocomplete
        allowsCustomValue
        label=""
        placeholder="Enter default value"
        defaultItems={DEFAULT_VALUE_OPTIONS}
        onValueChange={onDefaultValueChange}
        onSelectionChange={onDefaultValueSelectionChange}
        aria-label="Default Value"
      >
        {selectedDefaultValueOptions.map(item => (
          <AutocompleteItem key={item.value} value={item.value} textValue={item.label}>
            <div className="flex flex-col">
              <span className="text-small">{item.label}</span>
              <span className="text-tiny text-default-400">{item.description}</span>
            </div>
          </AutocompleteItem>
        ))}
      </Autocomplete>
      {defaultValueOption === 'normal_random' && (
        <>
          <Input
            type="text"
            label="Mean Value"
            placeholder=""
            onValueChange={onMeanValueChange}
            size="sm"
            value={`${meanValue}`}
          />
          <Input
            type="text"
            label="Standard Deviation"
            placeholder=""
            onValueChange={onStdValueChange}
            size="sm"
            value={`${stdValue}`}
          />
        </>
      )}
    </div>
  );
}
