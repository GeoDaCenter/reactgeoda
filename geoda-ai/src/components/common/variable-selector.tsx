import {selectKeplerDataset} from '@/store/selectors';
import {
  getIntegerAndStringFieldNamesFromDataset,
  getIntegerFieldNamesFromDataset,
  getNumericFieldNamesFromDataset,
  getStringFieldNamesFromDataset
} from '@/utils/data-utils';
import {Autocomplete, AutocompleteItem} from '@nextui-org/react';
import {Key, useMemo, useState} from 'react';
import {useSelector} from 'react-redux';

type VariableSelectorProps = {
  dataId?: string;
  variableType?: 'numeric' | 'integer' | 'string' | 'integer_or_string';
  setVariable: (variable: string) => void;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  optional?: boolean; // for optional vars
  isInvalid?: boolean;
};

export function VariableSelector({
  dataId,
  variableType = 'numeric',
  setVariable,
  label,
  size,
  isInvalid
}: VariableSelectorProps) {
  const dataset = useSelector(selectKeplerDataset(dataId));

  // state for variable
  const [localVariable, setLocalVariable] = useState<string>('');

  // get numeric columns from redux store
  const columnNames = useMemo(() => {
    let fieldNames: string[] = [];
    if (variableType === 'numeric') {
      fieldNames = getNumericFieldNamesFromDataset(dataset);
    } else if (variableType === 'integer') {
      fieldNames = getIntegerFieldNamesFromDataset(dataset);
    } else if (variableType === 'string') {
      fieldNames = getStringFieldNamesFromDataset(dataset);
    } else if (variableType === 'integer_or_string') {
      fieldNames = getIntegerAndStringFieldNamesFromDataset(dataset);
    }
    return fieldNames;
  }, [dataset, variableType]);

  // handle variable change
  const onVariableSelectionChange = (value: Key) => {
    const selectValue = value as string;
    setVariable(selectValue);
    // update variable in state
    setLocalVariable(selectValue);
  };

  return (
    <Autocomplete
      label={label || 'Select a variable'}
      className="max-w"
      onSelectionChange={onVariableSelectionChange}
      size={size || 'md'}
      selectedKey={localVariable}
      isInvalid={isInvalid}
    >
      {columnNames.map(column => (
        <AutocompleteItem key={column} value={column}>
          {column}
        </AutocompleteItem>
      ))}
    </Autocomplete>
  );
}
