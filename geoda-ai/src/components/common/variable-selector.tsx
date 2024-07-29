import {selectKeplerDataset} from '@/store/selectors';
import {
  getIntegerAndStringFieldNamesFromDataset,
  getIntegerFieldNamesFromDataset,
  getNumericFieldNamesFromDataset,
  getStringFieldNamesFromDataset
} from '@/utils/data-utils';
import KeplerTable from '@kepler.gl/table';
import {Autocomplete, AutocompleteItem} from '@nextui-org/react';
import {Key, useMemo, useState} from 'react';
import {useSelector} from 'react-redux';

export enum VARIABLE_TYPE {
  Numeric = 'numeric',
  Integer = 'integer',
  String = 'string',
  IntegerOrString = 'integer_or_string'
}

type VariableSelectorProps = {
  dataId?: string;
  variableType?: VARIABLE_TYPE;
  defaultVariable?: string;
  setVariable: (variable: string) => void;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  optional?: boolean; // for optional vars
  isInvalid?: boolean;
};

export function getFieldNames(dataset: KeplerTable, variableType: VARIABLE_TYPE) {
  if (variableType === VARIABLE_TYPE.Numeric) {
    return getNumericFieldNamesFromDataset(dataset);
  } else if (variableType === VARIABLE_TYPE.Integer) {
    return getIntegerFieldNamesFromDataset(dataset);
  } else if (variableType === VARIABLE_TYPE.String) {
    return getStringFieldNamesFromDataset(dataset);
  } else if (variableType === VARIABLE_TYPE.IntegerOrString) {
    return getIntegerAndStringFieldNamesFromDataset(dataset);
  }
  return [];
}

export function VariableSelector({
  dataId,
  defaultVariable,
  variableType = VARIABLE_TYPE.Numeric,
  setVariable,
  label,
  size
}: VariableSelectorProps) {
  const keplerDataset = useSelector(selectKeplerDataset(dataId));

  // get numeric columns from redux store
  const columnNames = useMemo(
    () => getFieldNames(keplerDataset, variableType),
    [keplerDataset, variableType]
  );

  // state for variable
  const [localVariable, setLocalVariable] = useState<string>(
    defaultVariable && columnNames.indexOf(defaultVariable) > -1 ? defaultVariable : ''
  );

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
      isInvalid={localVariable.length === 0 || !localVariable}
    >
      {columnNames.map(column => (
        <AutocompleteItem key={column} value={column}>
          {column}
        </AutocompleteItem>
      ))}
    </Autocomplete>
  );
}
