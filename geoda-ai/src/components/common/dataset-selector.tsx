import {setDefaultDatasetId} from '@/actions';
import {datasetsSelector} from '@/store/selectors';
import {Autocomplete, AutocompleteItem} from '@nextui-org/react';
import {Key} from 'react';
import {useDispatch, useSelector} from 'react-redux';

type DatasetSelectorProps = {
  datasetId: string;
  setDatasetId: (datasetName: string) => void;
  updateDefaultDatasetId?: boolean;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
};

export function DatasetSelector({
  datasetId,
  setDatasetId,
  updateDefaultDatasetId = true,
  label,
  size
}: DatasetSelectorProps) {
  const dispatch = useDispatch();
  const datasets = useSelector(datasetsSelector);

  const onDatasetSelectionChange = (value: Key | null) => {
    const selectValue = value as string;
    if (selectValue && selectValue.length > 0) {
      // update variable in state
      setDatasetId(selectValue);
      if (updateDefaultDatasetId) {
        // update default dataset id in store
        dispatch(setDefaultDatasetId(selectValue));
      }
    }
  };

  return (
    <Autocomplete
      label={label || 'Select dataset'}
      className="max-w"
      onSelectionChange={onDatasetSelectionChange}
      size={size || 'md'}
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
