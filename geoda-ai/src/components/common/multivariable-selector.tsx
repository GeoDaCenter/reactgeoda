import {selectKeplerDataset} from '@/store/selectors';
import {getNumericFieldNamesFromDataset} from '@/utils/data-utils';
import {Chip, Listbox, ListboxItem, ScrollShadow} from '@nextui-org/react';
import {useMemo, useState} from 'react';
import {useSelector} from 'react-redux';

type MultiVariableSelectorProps = {
  datasetId: string;
  variables?: string[];
  excludeVariables?: string[];
  setVariables: (variables: string[]) => void;
  label?: string;
  isInvalid?: boolean;
};

export function MultiVariableSelector(props: MultiVariableSelectorProps) {
  const {datasetId, label, isInvalid, setVariables, excludeVariables} = props;
  const [selectedKeys, setSelectedKeys] = useState(new Set([]));
  const selectedVariables = Array.from(selectedKeys);
  const keplerDataset = useSelector(selectKeplerDataset(datasetId));

  // get numeric columns from redux store
  const numericColumns = useMemo(() => {
    const fieldNames = getNumericFieldNamesFromDataset(keplerDataset);
    if (excludeVariables) {
      return fieldNames.filter(column => !excludeVariables.includes(column));
    }
    return fieldNames;
  }, [excludeVariables, keplerDataset]);

  // handle variable change
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
          {numericColumns.map(column => (
            <ListboxItem key={column} value={column}>
              {column}
            </ListboxItem>
          ))}
        </Listbox>
      </ScrollShadow>
    </div>
  );
}
