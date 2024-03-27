import {GeoDaState} from '@/store';
import {getLayer, getNumericFieldNames} from '@/utils/data-utils';
import {Select, SelectItem} from '@nextui-org/react';
import {useMemo} from 'react';
import {useSelector} from 'react-redux';

type MultiVariableSelectorProps = {
  variables?: string[];
  setVariables: (variables: string[]) => void;
  label?: string;
};

export function MultiVariableSelector(props: MultiVariableSelectorProps) {
  // use selector to get layer from redux store
  const layer = useSelector((state: GeoDaState) => getLayer(state));

  // get numeric columns from redux store
  const numericColumns = useMemo(() => {
    const fieldNames = getNumericFieldNames(layer);
    return fieldNames;
  }, [layer]);

  // handle variable change
  function onVariableSelectionChange(keys: any) {
    props.setVariables(Array.from(keys));
  }

  return (
    <Select
      label={props.label || 'Select variables'}
      className="max-w"
      onSelectionChange={onVariableSelectionChange}
      selectionMode="multiple"
    >
      {numericColumns.map(column => (
        <SelectItem key={column} value={column}>
          {column}
        </SelectItem>
      ))}
    </Select>
  );
}
