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
import {Key, useEffect, useRef, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {editor} from 'monaco-editor';
import MonacoEditor, {Monaco} from '@monaco-editor/react';
import {ALL_FIELD_TYPES} from '@kepler.gl/constants';
import {
  addKeplerColumn,
  createMonacoSuggestions,
  generateSQLUpdateColumn,
  validateColumnName
} from '@/utils/table-utils';
import {useDuckDB} from '@/hooks/use-duckdb';
import {GeoDaState} from '@/store';
import {getDataset} from '@/utils/data-utils';
import {DefaultValueComponent} from './default-column-component';
import {PreviewDataTable} from './preview-data-table';
import {TableVariableValueComponent} from './variable-column-component';
import {SQL_KEYWORDS} from '@/constants';

export function AddColumn() {
  const [columnName, setColumnName] = useState('');
  const [columnType, setColumnType] = useState('real');
  const [code, setCode] = useState('');
  const [values, setValues] = useState<unknown | unknown[]>(null);
  const [previewTab, setPreviewTab] = useState('preview-table');
  const [columnNameError, setColumnNameError] = useState(false);

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
    // editorRef.current?.trigger('', 'editor.action.triggerSuggest', {});
  };

  // format the code in manaco editor after the component is mounted
  const onEditorMount = (editor: editor.IStandaloneCodeEditor, monaco: Monaco) => {
    editorRef.current = editor;
    const columnNames = dataset?.fields.map(field => field.name) || [];
    // concat column names with SQL_KEYWORDS
    const suggestKeys = [...columnNames, ...SQL_KEYWORDS];
    const customSuggestions = createMonacoSuggestions(suggestKeys);
    monaco.languages.registerCompletionItemProvider('sql', {
      provideCompletionItems: (model, position) => {
        const word = model.getWordUntilPosition(position);
        const range = {
          startLineNumber: position.lineNumber,
          startColumn: word.startColumn,
          endLineNumber: position.lineNumber,
          endColumn: position.column
        };
        const suggestions = customSuggestions.map(suggestion => {
          return {
            label: suggestion.label,
            kind: monaco.languages.CompletionItemKind.Field,
            insertText: suggestion.insertText,
            range
          };
        });
        return {
          suggestions
        };
      }
    });
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
    // check columnName exists in dataset
    setColumnNameError(dataset?.fields.find(field => field.name === columnName) !== undefined);
  }, [columnName, columnType, dataset?.fields, tableName, values]);

  // handle column name change
  const handleColumnNameChange = (value: string) => {
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

  // check if add column button is valid
  const isAddColumnButtonValid = validateColumnName(columnName) && validateColumnName(columnType);

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
        onValueChange={handleColumnNameChange}
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
              <TableVariableValueComponent />
            </Tab>
            <Tab key="spatial-lag" title="Spatial Lag" />
            <Tab key="rates" title="Rates" />
            <Tab key="date-time" title="Date/Time" />
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
              <div className="relative h-40 w-full">
                <MonacoEditor
                  defaultLanguage="sql"
                  value={code}
                  onChange={onMonacoEditorChange}
                  onMount={onEditorMount}
                  options={{
                    minimap: {enabled: false},
                    fixedOverflowWidgets: true
                  }}
                  theme={theme === 'dark' ? 'vs-dark' : 'vs-light'}
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
