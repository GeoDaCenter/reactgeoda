import {useDuckDB} from '@/hooks/use-duckdb';
import {GeoDaState} from '@/store';
import {getDataset} from '@/utils/data-utils';
import {
  Input,
  Button,
  Card,
  CardBody,
  CardHeader,
  Tabs,
  Tab,
  RadioGroup,
  Radio
} from '@nextui-org/react';
import {useEffect, useRef, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {editor} from 'monaco-editor';
import MonacoEditor from '@monaco-editor/react';
import {generateSQLUpdateColumn, validateColumnName} from '@/utils/table-utils';
import {ALL_FIELD_TYPES} from '@kepler.gl/constants';
import {addTableColumn} from '@kepler.gl/actions';
import {Field} from '@kepler.gl/types';
import {DefaultValueComponent} from './default-column-component';

export function AddColumn() {
  const [columnName, setColumnName] = useState('');
  const [columnType, setColumnType] = useState('real');
  const [code, setCode] = useState('');
  const [values, setValues] = useState<unknown | unknown[]>([]);

  const {addColumn} = useDuckDB();
  const dispatch = useDispatch();
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const theme = useSelector((state: GeoDaState) => state.root.uiState.theme);
  const tableName = useSelector((state: GeoDaState) => state.root.file?.rawFileData?.fileName);
  const dataset = useSelector((state: GeoDaState) => getDataset(state));
  const numberOfRows = dataset?.dataContainer.numRows() || 0;

  const onMonacoEditorChange = (value: string | undefined) => {
    if (value) {
      setCode(value);
    }
    editorRef.current?.getAction('editor.action.formatDocument')?.run();
  };

  // format the code in manaco editor after the component is mounted
  const onEditorMount = (editor: editor.IStandaloneCodeEditor) => {
    editorRef.current = editor;
  };

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
  }, [columnName, columnType, tableName, values]);

  // handle column name change
  const handleColumnNameChange = (value: string) => {
    setColumnName(value);
  };

  // handle column type change
  const handleColumnTypeChange = (value: string) => {
    setColumnType(value);
  };

  // add column click handler
  const handleAddColumnClick = () => {
    // Add logic to handle adding a new column with the provided values
    addColumn(code);

    if (dataset) {
      // add new column to kepler.gl
      const newFieldName = columnName;

      // get dataset from kepler.gl if dataset.label === tableName
      const dataContainer = dataset.dataContainer;
      const fieldsLength = dataset.fields.length;

      // create new field
      const newField: Field = {
        id: newFieldName,
        name: newFieldName,
        displayName: newFieldName,
        format: '',
        type: ALL_FIELD_TYPES.real,
        analyzerType: 'FLOAT',
        fieldIdx: fieldsLength,
        valueAccessor: (d: any) => {
          return dataContainer?.valueAt(d.index, fieldsLength);
        }
      };

      const values = Array(numberOfRows).fill(0);

      // Add a new column without data first, so it can avoid error from deduceTypeFromArray()
      dispatch(addTableColumn(dataset.id, newField, values));
    }
  };

  const isValid = validateColumnName(columnName) && validateColumnName(columnType);

  return (
    <div className="flex flex-col gap-2">
      <Input
        type="text"
        label="Column Name"
        placeholder="Enter column name"
        onValueChange={handleColumnNameChange}
      />
      <RadioGroup
        label="Select data type"
        onValueChange={handleColumnTypeChange}
        size="sm"
        className="m-2 text-xs"
        value={columnType}
      >
        <Radio key="string" value="string">
          String
        </Radio>
        <Radio key="integer" value="integer">
          Integer
        </Radio>
        <Radio key="real" value="real">
          Real
        </Radio>
      </RadioGroup>
      <Tabs aria-label="Select Value" size="sm" variant="underlined">
        <Tab key="default-value" title="Default Value">
          <Card>
            <CardBody className="flex flex-col gap-1">
              <DefaultValueComponent
                numberOfRows={numberOfRows}
                columnType={columnType}
                setValues={setValues}
              />
            </CardBody>
          </Card>
        </Tab>
        <Tab key="variable" title="Variable" />
        <Tab key="spatial-lag" title="Spatial Lag" />
        <Tab key="rates" title="Rates" />
        <Tab key="date-time" title="Date/Time" />
      </Tabs>
      <Card className="mt-2">
        <CardHeader>
          <div className="text-xs">SQL Preview</div>
        </CardHeader>
        <CardBody>
          <div className="h-40 w-full">
            <MonacoEditor
              language="sql"
              value={code}
              onChange={onMonacoEditorChange}
              onMount={onEditorMount}
              options={{
                minimap: {enabled: false}
              }}
              theme={theme === 'dark' ? 'vs-dark' : 'vs-light'}
            />
          </div>
        </CardBody>
      </Card>
      <Button
        size="sm"
        color="primary"
        className="bg-rose-900"
        onClick={handleAddColumnClick}
        isDisabled={!isValid}
      >
        Add Column
      </Button>
    </div>
  );
}
