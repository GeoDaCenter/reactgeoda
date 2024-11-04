import {Autocomplete, AutocompleteItem} from '@nextui-org/react';
import {Key, useState} from 'react';

type VariableSelectorProps = {
  variables: string[];
  defaultVariable?: string;
  setVariable: (variable: string) => void;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  optional?: boolean; // for optional vars
  isInvalid?: boolean;
};

export function VariableSelector({
  variables,
  defaultVariable,
  setVariable,
  label,
  size
}: VariableSelectorProps) {
  const [localVariable, setLocalVariable] = useState<string>(
    defaultVariable && variables.indexOf(defaultVariable) > -1 ? defaultVariable : ''
  );

  const onVariableSelectionChange = (value: Key | null) => {
    if (!value) return;
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
      {variables.map(variable => (
        <AutocompleteItem key={variable} value={variable}>
          {variable}
        </AutocompleteItem>
      ))}
    </Autocomplete>
  );
}
