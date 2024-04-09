import React, {useEffect, useMemo, useState} from 'react';
import {useIntl} from 'react-intl';
import {useSelector} from 'react-redux';
import {Tabs, Tab, Card, CardBody} from '@nextui-org/react';

import {RightPanelContainer} from '../common/right-panel-template';
import {WarningBox} from '../common/warning-box';
import {GeoDaState} from '@/store';

const NO_MAP_LOADED_MESSAGE = 'Please load a map first before querying and editing data.';

export function TablePanel() {
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
        <div className="flex w-full flex-col p-4">
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
              key="weights-creation"
              title={
                <div className="flex items-center space-x-2">
                  <span>Table Query</span>
                </div>
              }
            >
              <Card>
                <CardBody>Table</CardBody>
              </Card>
            </Tab>
            <Tab
              key="weights-management"
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
