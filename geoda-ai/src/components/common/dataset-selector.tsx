import {datasetsSelector} from '@/store/selectors';
import {Autocomplete, AutocompleteItem} from '@nextui-org/react';
import {Key} from 'react';
import {useSelector} from 'react-redux';

type DatasetSelectorProps = {
  datasetId: string;
  setDatasetId: (datasetName: string) => void;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
};

export function DatasetSelector(props: DatasetSelectorProps) {
  const {datasetId, setDatasetId} = props;
  const datasets = useSelector(datasetsSelector);

  const onDatasetSelectionChange = (value: Key) => {
    const selectValue = value as string;
    // update variable in state
    setDatasetId(selectValue);
  };

  return (
    <Autocomplete
      label={props.label || 'Select dataset'}
      className="max-w"
      onSelectionChange={onDatasetSelectionChange}
      size={props.size || 'md'}
      selectedKey={datasetId}
      isInvalid={!datasetId || datasetId.length === 0}
    >
      {datasets.map((d, i) => (
        <AutocompleteItem key={d.dataId || i} value={d.dataId}>
          {d.fileName}
        </AutocompleteItem>
      ))}
    </Autocomplete>
  );
}
