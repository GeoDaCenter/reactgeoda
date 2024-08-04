import {
  Input,
  Card,
  CardBody,
  Tabs,
  Tab,
  Select,
  SelectItem,
  Selection,
  CardHeader
} from '@nextui-org/react';
import {Key, useRef, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {ALL_FIELD_TYPES} from '@kepler.gl/constants';
import {
  addKeplerColumn,
  generateSQLUpdateColumn,
  validataColumnType,
  validateColumnName
} from '@/utils/table-utils';
import {useDuckDB} from '@/hooks/use-duckdb';
import {GeoDaState} from '@/store';
import {DefaultValueComponent} from './column-default-component';
import {PreviewDataTable} from './preview-data-table';
import {TableVariableValueComponent} from './column-variable-component';
import {SQL_KEYWORDS} from '@/constants';
import {SQLEditor, SQLEditorRefProps} from './sql-editor';
import {SpatialLagValueComponent} from './column-spatial-lag-component';
import {RateValueComponent} from '../common/rate-value-component';
import {CreateButton} from '../common/create-button';
import {addTableColumn} from '@kepler.gl/actions';
import {DatasetSelector} from '../common/dataset-selector';
import KeplerTable from '@kepler.gl/table';

export function AddColumn({
  datasetId,
  setDatasetId,
  keplerDataset,
  tableName
}: {
  datasetId: string;
  setDatasetId: (datasetId: string) => void;
  keplerDataset: KeplerTable;
  tableName: string;
}) {
  const [columnName, setColumnName] = useState('');
  const [columnType, setColumnType] = useState<string>(ALL_FIELD_TYPES.real);
  const [values, setValues] = useState<unknown | unknown[]>(null);
  const [previewTab, setPreviewTab] = useState('preview-table');

  const {addColumn, addColumnWithValues} = useDuckDB();
  const dispatch = useDispatch();
  const editorRef = useRef<SQLEditorRefProps>(null);

  const theme = useSelector((state: GeoDaState) => state.root.uiState.theme);

  const numberOfRows = keplerDataset?.dataContainer.numRows() || 0;
  const suggestKeys = [...(keplerDataset?.fields.map(field => field.name) || []), ...SQL_KEYWORDS];

  // update SQL code when column name, column type or values change
  const initialCode = generateSQLUpdateColumn({
    tableName,
    columnName,
    columnType,
    values
  });
  const [code, setCode] = useState(initialCode);
  if (code !== initialCode) {
    // don't update unnecessarily
    setCode(initialCode);
  }

  // check if column name already exists
  const isColumnNameExists =
    keplerDataset?.fields.find(field => field.name === columnName) !== undefined;
  const [columnNameError, setColumnNameError] = useState(isColumnNameExists);

  // check if add column button is valid
  const isAddColumnButtonValid =
    datasetId &&
    datasetId.length > 0 &&
    validateColumnName(columnName) &&
    validataColumnType(columnType);

  // on SQL editor change
  const onSQLEditorChange = (value: string | undefined) => {
    if (value) {
      setCode(value);
    }
  };

  // handle column name change
  const onColumnNameChange = (value: string) => {
    // if column name is empty, recreate code using generateSQLUpdateColumn
    if (columnName === '') {
      setCode(
        generateSQLUpdateColumn({
          tableName,
          columnName: value,
          columnType,
          values
        })
      );
    } else {
      // replace old column name with new column name in code state
      setCode(code.replace(columnName, value));
    }
    setColumnName(value);
    setColumnNameError(keplerDataset?.fields.find(field => field.name === value) !== undefined);
  };

  // handle column type change
  const onDataTypeSelectionChange = (keys: Selection) => {
    // check if keys is type of Set
    if (keys instanceof Set) {
      const colType = keys.values().next().value as string;
      setColumnType(colType);
    }
  };

  // handle preview selection change
  const onPreviewSelectionChange = (key: Key) => {
    setPreviewTab(key as string);
  };

  const onRateValuesChange = (values: unknown | unknown[]) => {
    setValues(values);
  };

  // handle add column
  const handleAddColumnClick = () => {
    // add column to duckdb
    if (Array.isArray(values)) {
      // check if values are array of string
      const isStringArray = values.some(v => typeof v === 'string');
      addColumnWithValues({
        tableName,
        columnName,
        columnValues: values,
        columnType: isStringArray ? 'VARCHAR' : 'NUMERIC'
      });
    } else {
      addColumn(code);
    }

    // add column to kepler.gl
    if (keplerDataset) {
      const {newField, values: columnData} = addKeplerColumn({
        dataset: keplerDataset,
        newFieldName: columnName,
        fieldType: columnType,
        columnData: values
      });
      dispatch(addTableColumn(keplerDataset.id, newField, columnData));
    }
    // reset column name
    setColumnName('');
  };

  return (
    <div className="flex flex-col gap-2">
      <DatasetSelector datasetId={datasetId} setDatasetId={setDatasetId} />
      <Input
        type="text"
        label="Column Name"
        placeholder="Enter column name"
        onValueChange={onColumnNameChange}
        isInvalid={columnName === '' || columnNameError}
        errorMessage={columnNameError ? '* column name already exists' : ''}
      />
      <Select
        label="Column Type"
        placeholder="Select data type"
        onSelectionChange={onDataTypeSelectionChange}
        size="sm"
        className="text-xs"
        defaultSelectedKeys={[ALL_FIELD_TYPES.real]}
      >
        <SelectItem key="string" value={ALL_FIELD_TYPES.string}>
          String
        </SelectItem>
        <SelectItem key="integer" value={ALL_FIELD_TYPES.integer}>
          Integer
        </SelectItem>
        <SelectItem key="real" value={ALL_FIELD_TYPES.real}>
          Real
        </SelectItem>
      </Select>
      <Card>
        <CardHeader>
          <p className="text-tiny">Column Value</p>
        </CardHeader>
        <CardBody>
          <Tabs aria-label="Select Value" size="sm" variant="solid">
            <Tab key="default-value" title="Default Value">
              <DefaultValueComponent
                numberOfRows={numberOfRows}
                columnType={columnType}
                setValues={setValues}
              />
            </Tab>
            <Tab key="variable" title="Variable">
              <TableVariableValueComponent
                tableName={tableName}
                keplerDataset={keplerDataset}
                setValues={setValues}
              />
            </Tab>
            <Tab key="spatial-lag" title="Spatial Lag">
              <SpatialLagValueComponent
                tableName={tableName}
                keplerDataset={keplerDataset}
                setValues={setValues}
              />
            </Tab>
            <Tab key="rates" title="Rates">
              <RateValueComponent
                tableName={tableName}
                keplerDataset={keplerDataset}
                onValuesChange={onRateValuesChange}
              />
            </Tab>
          </Tabs>
        </CardBody>
      </Card>
      <Card className="mt-2">
        <CardBody>
          <Tabs
            aria-label="preview-and-sql"
            size="sm"
            selectedKey={previewTab}
            onSelectionChange={onPreviewSelectionChange}
          >
            <Tab key="preview-table" title="Column Preview">
              <PreviewDataTable
                fieldName={columnName}
                fieldType={columnType}
                columnData={values}
                numberOfRows={numberOfRows}
              />
            </Tab>
            <Tab key="preview-sql" title="SQL Preview">
              <div className="h-40 w-full">
                <SQLEditor
                  initContent={code}
                  onChange={onSQLEditorChange}
                  theme={theme}
                  suggestKeys={suggestKeys}
                  ref={editorRef}
                />
              </div>
            </Tab>
          </Tabs>
        </CardBody>
      </Card>
      <CreateButton onClick={handleAddColumnClick} isDisabled={!isAddColumnButtonValid}>
        Add Column
      </CreateButton>
    </div>
  );
}
