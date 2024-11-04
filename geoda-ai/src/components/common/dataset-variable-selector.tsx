import {selectKeplerDataset, datasetsSelector} from '@/store/selectors';
import {getFieldNames, VARIABLE_TYPE} from '@/utils/data-utils';
import {Autocomplete, AutocompleteItem} from '@nextui-org/react';
import {Key, useMemo} from 'react';
import {useSelector} from 'react-redux';

export type onDatasetVariableSelectionChangeProps = {
  dataId?: string;
  variable?: string;
};

type DatasetVariableSelectorProps = {
  datasetId: string;
  setDatasetId: (datasetId: string) => void;
  variable: string;
  setVariable: (variable: string) => void;
  variableType?: VARIABLE_TYPE;
  onSelectionChange: ({dataId, variable}: onDatasetVariableSelectionChangeProps) => void;
  datasetLabel?: string;
  variableLabel?: string;
  size?: 'sm' | 'md' | 'lg';
};

export function DatasetVariableSelector({
  datasetId,
  setDatasetId,
  variable,
  setVariable,
  variableType = VARIABLE_TYPE.Numeric,
  onSelectionChange,
  datasetLabel,
  variableLabel,
  size
}: DatasetVariableSelectorProps) {
  const datasets = useSelector(datasetsSelector);

  const keplerDataset = useSelector(selectKeplerDataset(datasetId));

  // get numeric columns
  const columnNames = useMemo(
    () => getFieldNames(keplerDataset, variableType),
    [keplerDataset, variableType]
  );

  // handle variable change
  const onVariableSelectionChange = (value: Key | null) => {
    if (!value) return;
    const selectValue = value as string;
    onSelectionChange({variable: selectValue, dataId: keplerDataset?.id});
    setVariable(selectValue);
  };

  const onDatasetSelectionChange = (value: Key | null) => {
    if (!value) return;
    const selectValue = value as string;
    onSelectionChange({dataId: selectValue, variable});
    setDatasetId(selectValue);
  };

  return (
    <div className="flex flex-col gap-2">
      <Autocomplete
        label={datasetLabel || 'Select a dataset'}
        className="max-w"
        onSelectionChange={onDatasetSelectionChange}
        size={size || 'md'}
        selectedKey={keplerDataset.id}
        isInvalid={!keplerDataset || keplerDataset.id.length === 0}
      >
        {datasets?.map((d, i) => (
          <AutocompleteItem key={d.dataId || i} value={d.dataId}>
            {d.fileName}
          </AutocompleteItem>
        ))}
      </Autocomplete>
      <Autocomplete
        label={variableLabel || 'Select a variable'}
        className="max-w"
        onSelectionChange={onVariableSelectionChange}
        size={size || 'md'}
        selectedKey={variable}
        isInvalid={!variable || variable.length === 0}
      >
        {columnNames.map(column => (
          <AutocompleteItem key={column} value={column}>
            {column}
          </AutocompleteItem>
        ))}
      </Autocomplete>
    </div>
  );
}
