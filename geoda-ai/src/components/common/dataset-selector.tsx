import {datasetsSelector} from '@/store/selectors';
import {Autocomplete, AutocompleteItem} from '@nextui-org/react';
import {Key, useState} from 'react';
import {useSelector} from 'react-redux';

type DatasetSelectorProps = {
  datasetId?: string;
  setDatasetId: (datasetName: string) => void;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  optional?: boolean; // for optional vars
  isInvalid?: boolean;
};

export function DatasetSelector(props: DatasetSelectorProps) {
  const datasets = useSelector(datasetsSelector);

  const [dataId, setDataId] = useState<string>(props.datasetId || '');

  const onDatasetSelectionChange = (value: Key) => {
    const selectValue = value as string;
    props.setDatasetId(selectValue);
    // update variable in state
    setDataId(selectValue);
  };

  return (
    <Autocomplete
      label={props.label || 'Select dataset'}
      className="max-w"
      onSelectionChange={onDatasetSelectionChange}
      size={props.size || 'md'}
      selectedKey={dataId}
      isInvalid={props.isInvalid}
    >
      {datasets.map((d, i) => (
        <AutocompleteItem key={d.dataId || i} value={d.dataId}>
          {d.fileName}
        </AutocompleteItem>
      ))}
    </Autocomplete>
  );
}
