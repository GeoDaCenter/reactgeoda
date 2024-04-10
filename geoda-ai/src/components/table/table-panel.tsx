import React, {useState} from 'react';
import {useIntl} from 'react-intl';
import {useSelector} from 'react-redux';
import {Tabs, Tab, Button} from '@nextui-org/react';

import {RightPanelContainer} from '../common/right-panel-template';
import {WarningBox} from '../common/warning-box';
import {GeoDaState} from '@/store';
import {TableQueryComponent} from './table-query-component';

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

function TablePanel() {
  const intl = useIntl();

  const tableName = useSelector((state: GeoDaState) => state.root.file?.rawFileData?.fileName);

  const onTabChange = (key: React.Key) => {
    if (key === 'table-query') {
      console.log('table-query');
    }
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
              <TableQueryComponent />
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
