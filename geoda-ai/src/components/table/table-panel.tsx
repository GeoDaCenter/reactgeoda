import React, {useMemo, useState} from 'react';
import {useIntl} from 'react-intl';
import {useDispatch, useSelector} from 'react-redux';
import {Tabs, Tab, Card, CardBody, Button, Checkbox, CardHeader} from '@nextui-org/react';
import MonacoEditor from '@monaco-editor/react';
import {formatQuery, QueryBuilder, RuleGroupType} from 'react-querybuilder';
import 'react-querybuilder/dist/query-builder.css';

import {RightPanelContainer} from '../common/right-panel-template';
import {WarningBox} from '../common/warning-box';
import {GeoDaState} from '@/store';
import {useDuckDB} from '@/hooks/use-duckdb';
import {getDataset} from '@/utils/data-utils';
import {getQueryBuilderFields} from '@/utils/table-utils';

const NO_MAP_LOADED_MESSAGE = 'Please load a map first before querying and editing data.';

// React component that renders adding a new column to the table
// @returns {JSX.Element} React component
export function AddColumn() {
  const [columnName, setColumnName] = useState('');
  const [columnType, setColumnType] = useState('');
  const [defaultValue, setDefaultValue] = useState('');

  const handleColumnNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setColumnName(e.target.value);
  };

  const handleColumnTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setColumnType(e.target.value);
  };

  const handleDefaultValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDefaultValue(e.target.value);
  };

  const handleAddColumnClick = () => {
    // Add logic to handle adding a new column with the provided values
  };

  const [generateRandom, setGenerateRandom] = useState(false);
  const handleGenerateRandomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setGenerateRandom(e.target.checked);
  };

  return (
    <div className="flex flex-row items-center space-x-2">
      <input
        type="text"
        value={columnName}
        onChange={handleColumnNameChange}
        placeholder="Column Name"
      />
      <select value={columnType} onChange={handleColumnTypeChange}>
        <option value="">Select Column Type</option>
        <option value="text">Text</option>
        <option value="number">Number</option>
        <option value="boolean">Boolean</option>
      </select>
      <input
        type="text"
        value={defaultValue}
        onChange={handleDefaultValueChange}
        placeholder="Default Value"
      />
      <label>
        <input type="checkbox" checked={generateRandom} onChange={handleGenerateRandomChange} />
        Generate Random
      </label>
      <Button size="sm" onClick={handleAddColumnClick}>
        Add Column
      </Button>
    </div>
  );
}

const initialQuery: RuleGroupType = {combinator: 'and', rules: []};

function TablePanel() {
  const intl = useIntl();
  const dispatch = useDispatch();

  const tableName = useSelector((state: GeoDaState) => state.root.file?.rawFileData?.fileName);
  const theme = useSelector((state: GeoDaState) => state.root.uiState.theme);
  const dataset = useSelector((state: GeoDaState) => getDataset(state));

  // get fields for query builder
  const fields = useMemo(() => getQueryBuilderFields(dataset), [dataset]);

  // set state for monaco editor
  const [code, setCode] = useState('');

  const [useQueryBuilder, setUseQueryBuilder] = useState(true);
  const [sqlQuery, setSqlQuery] = useState(initialQuery);

  const onTabChange = (key: React.Key) => {
    if (key === 'table-query') {
      console.log('table-query');
    }
  };

  const onMonacoEditorChange = (value: string | undefined) => {
    if (value) {
      setCode(value);
    }
  };

  // get duckdb hook
  const {query} = useDuckDB();

  // write callback function onQueryClick
  const onQueryClick = async () => {
    const selectedIndexes = await query(tableName, code);

    if (selectedIndexes) {
      // dispatch action SET_FILTER_INDEXES to update filtered indexes in kepler
      dispatch({
        type: 'SET_FILTER_INDEXES',
        payload: {dataLabel: tableName, filteredIndex: selectedIndexes}
      });
      // const newData = processArrowTable(result);
      // const updatedDataset: ProtoDataset = {
      //   // @ts-expect-error FIXME
      //   data: newData,
      //   info: {
      //     id: generateHashIdFromString(tableName),
      //     label: tableName,
      //     format: 'arrow'
      //   }
      // };
      // // dispatch action to update dataset in kepler
      // dispatch(updateVisData([updatedDataset], {keepExistingConfig: true}));
      // const keplerTable = datasets[info.id];
      // // update the data in keplerTable
      // keplerTable.update(validatedData);
    }
  };

  const onResetClick = () => {
    setCode('');
  };

  const onQueryBuilderClick = (value: boolean) => {
    setUseQueryBuilder(value);
  };

  const onQueryChange = (queryString: RuleGroupType) => {
    setSqlQuery(queryString);
    setCode(formatQuery(queryString, 'sql'));
  };

  return (
    <RightPanelContainer
      title={intl.formatMessage({
        id: 'table.title',
        defaultMessage: 'Table'
      })}
      description={intl.formatMessage({
        id: 'table.description',
        defaultMessage: 'Query and edit the table data.'
      })}
    >
      {!tableName ? (
        <WarningBox message={NO_MAP_LOADED_MESSAGE} type="warning" />
      ) : (
        <div className="flex w-full flex-col p-1">
          <Tabs
            aria-label="Options"
            variant="solid"
            color="warning"
            classNames={{}}
            size="md"
            selectedKey={'table-query'}
            onSelectionChange={onTabChange}
          >
            <Tab
              key="table-query"
              title={
                <div className="flex items-center space-x-2">
                  <span>Query</span>
                </div>
              }
            >
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-4 text-xs">
                  <Checkbox
                    defaultSelected
                    size="sm"
                    checked={useQueryBuilder}
                    onValueChange={onQueryBuilderClick}
                  >
                    Use Query Builder
                  </Checkbox>
                  {useQueryBuilder && (
                    <QueryBuilder
                      query={sqlQuery}
                      onQueryChange={onQueryChange}
                      fields={fields}
                      controlClassnames={{queryBuilder: 'queryBuilder-branches'}}
                    />
                  )}
                </div>
                <Card>
                  <CardHeader>
                    <p className="ml-2 text-xs text-blue-700 drop-shadow-sm">
                      SELECT * FROM <br /> {tableName} <br />
                      WHERE
                    </p>
                  </CardHeader>
                  <CardBody>
                    <div className="h-80 w-full">
                      <MonacoEditor
                        language="sql"
                        value={code}
                        onChange={onMonacoEditorChange}
                        options={{
                          minimap: {enabled: false}
                        }}
                        theme={theme === 'dark' ? 'vs-dark' : 'vs-light'}
                      />
                    </div>
                    <div className="m-2 flex w-full flex-row items-start space-x-4">
                      <Button onClick={onQueryClick} size="sm" color="primary">
                        Query
                      </Button>
                      <Button onClick={onResetClick} size="sm">
                        Reset
                      </Button>
                    </div>
                  </CardBody>
                </Card>
              </div>
            </Tab>
            <Tab
              key="table-edit"
              title={
                <div className="flex items-center space-x-2">
                  <span>Edit</span>
                </div>
              }
            >
              History
            </Tab>
          </Tabs>
        </div>
      )}
    </RightPanelContainer>
  );
}

export default TablePanel;
