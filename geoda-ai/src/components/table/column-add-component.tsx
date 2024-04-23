import {
  Input,
  Button,
  Card,
  CardBody,
  Tabs,
  Tab,
  Select,
  SelectItem,
  Selection
} from '@nextui-org/react';
import {Key, useEffect, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {ALL_FIELD_TYPES} from '@kepler.gl/constants';
import {addKeplerColumn, generateSQLUpdateColumn, validateColumnName} from '@/utils/table-utils';
import {useDuckDB} from '@/hooks/use-duckdb';
import {GeoDaState} from '@/store';
import {getDataset} from '@/utils/data-utils';
import {DefaultValueComponent} from './column-default-component';
import {PreviewDataTable} from './preview-data-table';
import {TableVariableValueComponent} from './column-variable-component';
import {SQL_KEYWORDS} from '@/constants';
import {SQLEditor} from './sql-editor';

export function AddColumn() {
  const [columnName, setColumnName] = useState('');
  const [columnType, setColumnType] = useState('real');
  const [code, setCode] = useState('');
  const [values, setValues] = useState<unknown | unknown[]>(null);
  const [previewTab, setPreviewTab] = useState('preview-table');
  const [columnNameError, setColumnNameError] = useState(false);

  const {addColumn} = useDuckDB();
  const dispatch = useDispatch();
  const theme = useSelector((state: GeoDaState) => state.root.uiState.theme);
  const tableName = useSelector((state: GeoDaState) => state.root.file?.rawFileData?.fileName);
  const dataset = useSelector((state: GeoDaState) => getDataset(state));

  const numberOfRows = dataset?.dataContainer.numRows() || 0;
  const suggestKeys = [...(dataset?.fields.map(field => field.name) || []), ...SQL_KEYWORDS];

  // check if add column button is valid
  const isAddColumnButtonValid = validateColumnName(columnName) && validateColumnName(columnType);

  // update SQL code when column name, column type or values change
  useEffect(() => {
    if (!columnName || !columnType || !tableName || !values) return;
    const sql = generateSQLUpdateColumn({
      tableName,
      columnName,
      columnType,
      values
    });
    setCode(sql);
    // check columnName exists in dataset
    setColumnNameError(dataset?.fields.find(field => field.name === columnName) !== undefined);
  }, [columnName, columnType, dataset?.fields, tableName, values]);

  // on SQL editor change
  const onSQLEditorChange = (value: string | undefined) => {
    if (value) {
      setCode(value);
    }
  };

  // handle column name change
  const onColumnNameChange = (value: string) => {
    setColumnName(value);
  };

  // handle column type change
  const onDataTypeSelectionChange = (keys: Selection) => {
    // check if keys is type of Set
    if (keys instanceof Set) {
      setColumnType(keys.values().next().value);
    }
  };

  // handle add column
  const handleAddColumnClick = () => {
    // add column to duckdb
    addColumn(code);
    // add column to kepler.gl
    addKeplerColumn({
      dataset,
      newFieldName: columnName,
      fieldType: columnType,
      columnData: values,
      dispatch
    });
    // reset column name
    setColumnName('');
  };

  // handle preview selection change
  const onPreviewSelectionChange = (key: Key) => {
    setPreviewTab(key as string);
  };

  return (
    <div className="flex flex-col gap-2">
      <Input
        type="text"
        label="Column Name"
        placeholder="Enter column name"
        onValueChange={onColumnNameChange}
        isInvalid={columnNameError}
        errorMessage={columnNameError ? '* column name already exists' : ''}
      />
      <Select
        label="Column Type"
        placeholder="Select data type"
        onSelectionChange={onDataTypeSelectionChange}
        size="sm"
        className="text-xs"
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
              <TableVariableValueComponent setValues={setValues} />
            </Tab>
            <Tab key="spatial-lag" title="Spatial Lag" />
            <Tab key="rates" title="Rates" />
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
                />
              </div>
            </Tab>
          </Tabs>
        </CardBody>
      </Card>
      <Button
        size="sm"
        color="primary"
        className="bg-rose-900"
        onClick={handleAddColumnClick}
        isDisabled={!isAddColumnButtonValid}
      >
        Add Column
      </Button>
    </div>
  );
}
