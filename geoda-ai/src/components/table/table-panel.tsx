import React, {useEffect, useMemo, useState} from 'react';
import {useIntl} from 'react-intl';
import {useDispatch, useSelector} from 'react-redux';
import {Tabs, Tab, Card, CardBody, Button} from '@nextui-org/react';
import MonacoEditor from '@monaco-editor/react';

import {RightPanelContainer} from '../common/right-panel-template';
import {WarningBox} from '../common/warning-box';
import {GeoDaState} from '@/store';
import {useDuckDB} from '@/hooks/use-duckdb';

const NO_MAP_LOADED_MESSAGE = 'Please load a map first before querying and editing data.';

export function TablePanel() {
  const intl = useIntl();
  const dispatch = useDispatch();

  const tableName = useSelector((state: GeoDaState) => state.root.file?.rawFileData?.fileName);

  // set state for monaco editor
  const [code, setCode] = useState(`select * from "${tableName}"`);

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
    const selectedIndexes = await query(code);

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
    setCode(`select * from "${tableName}"`);
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
                  <span>Table Query</span>
                </div>
              }
            >
              <Card>
                <CardBody>
                  <div className="h-80 w-full">
                    <MonacoEditor
                      language="sql"
                      value={code}
                      onChange={onMonacoEditorChange}
                      options={{
                        minimap: {enabled: false}
                      }}
                    />
                  </div>
                  <div className="m-2 flex w-full flex-row items-start space-x-4">
                    <Button onClick={onQueryClick} size="sm">
                      Query
                    </Button>
                    <Button onClick={onResetClick} size="sm">
                      Reset
                    </Button>
                  </div>
                </CardBody>
              </Card>
            </Tab>
            <Tab
              key="table-history"
              title={
                <div className="flex items-center space-x-2">
                  <span>History</span>
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
