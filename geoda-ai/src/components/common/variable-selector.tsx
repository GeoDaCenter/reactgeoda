import {GeoDaState} from '@/store';
import {getLayer, getNumericFieldNames} from '@/utils/data-utils';
import {Autocomplete, AutocompleteItem} from '@nextui-org/react';
import {Key, useMemo} from 'react';
import {useSelector} from 'react-redux';

type VariableSelectorProps = {
  variable?: string;
  setVariable: (variable: string) => void;
};

export function VariableSelector(props: VariableSelectorProps) {
  // use selector to get layer from redux store
  const layer = useSelector((state: GeoDaState) => getLayer(state));

  // get numeric columns from redux store
  const numericColumns = useMemo(() => {
    const fieldNames = getNumericFieldNames(layer);
    return fieldNames;
  }, [layer]);

  // handle variable change
  const onVariableSelectionChange = (value: Key) => {
    const selectValue = value as string;
    props.setVariable(selectValue);
  };

  return (
    <Autocomplete
      label="Select a variable"
      className="max-w"
      onSelectionChange={onVariableSelectionChange}
    >
      {numericColumns.map(column => (
        <AutocompleteItem key={column} value={column}>
          {column}
        </AutocompleteItem>
      ))}
    </Autocomplete>
  );
}