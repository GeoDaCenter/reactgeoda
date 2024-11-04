import {Chip, Listbox, ListboxItem, ScrollShadow} from '@nextui-org/react';
import {useMemo, useState} from 'react';

type MultiVariableSelectorProps = {
  variables: string[];
  excludeVariables?: string[];
  setVariables: (variables: string[]) => void;
  label?: string;
  isInvalid?: boolean;
};

export function MultiVariableSelector(props: MultiVariableSelectorProps) {
  const {variables, label, isInvalid, setVariables, excludeVariables} = props;
  const [selectedKeys, setSelectedKeys] = useState(new Set([]));
  const selectedVariables = Array.from(selectedKeys);

  const columns = useMemo(() => {
    if (excludeVariables) {
      return variables.filter(column => !excludeVariables.includes(column));
    }
    return variables;
  }, [excludeVariables, variables]);

  function onVariableSelectionChange(keys: any) {
    setSelectedKeys(keys);
    setVariables(Array.from(keys));
  }

  const topContent = useMemo(() => {
    if (!selectedVariables.length) {
      return null;
    }

    return (
      <ScrollShadow
        hideScrollBar
        className="flex w-full gap-1 px-2 py-0.5"
        orientation="horizontal"
      >
        {selectedVariables.map(value => (
          <Chip key={value}>{value}</Chip>
        ))}
      </ScrollShadow>
    );
  }, [selectedVariables]);

  return (
    <div className="flex w-full flex-col gap-2">
      <span className={`m-2 text-sm  ${isInvalid ? 'text-danger' : ''}`}>
        {label || 'Select variables'}
      </span>
      {topContent}
      <ScrollShadow
        className={`${isInvalid ? 'bg-danger-50' : ''} h-[200px] w-full overflow-y-scroll rounded-small border-small border-default-200 px-1 py-2 dark:border-default-100`}
      >
        <Listbox
          aria-label="select variables"
          variant="flat"
          disallowEmptySelection
          selectionMode="multiple"
          selectedKeys={selectedKeys}
          onSelectionChange={onVariableSelectionChange}
        >
          {columns.map(column => (
            <ListboxItem key={column} value={column}>
              {column}
            </ListboxItem>
          ))}
        </Listbox>
      </ScrollShadow>
    </div>
  );
}
