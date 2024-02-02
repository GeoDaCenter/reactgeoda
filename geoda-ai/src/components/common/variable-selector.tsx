import {MAP_ID} from '@/constants';
import {GeoDaState} from '@/store';
import {getNumericFieldNames} from '@/utils/data-utils';
import {Autocomplete, AutocompleteItem} from '@nextui-org/react';
import {Key, useMemo} from 'react';
import {useSelector} from 'react-redux';

type VariableSelectorProps = {
  variable?: string;
  setVariable: (variable: string) => void;
};

export function VariableSelector(props: VariableSelectorProps) {
  // use selector to get tableName from redux store
  const tableName = useSelector((state: GeoDaState) => state.root.file?.rawFileData?.name);

  // use selector to get visState from redux store
  const visState = useSelector((state: GeoDaState) => state.keplerGl[MAP_ID].visState);

  // get numeric columns from redux store
  const numericColumns = useMemo(() => {
    const fieldNames = getNumericFieldNames(tableName, visState);
    return fieldNames;
  }, [tableName, visState]);

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
