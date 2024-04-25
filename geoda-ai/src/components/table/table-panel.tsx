import React from 'react';
import {useIntl} from 'react-intl';
import {useSelector} from 'react-redux';
import {Tabs, Tab, Card, CardBody} from '@nextui-org/react';

import {RightPanelContainer} from '../common/right-panel-template';
import {WarningBox} from '../common/warning-box';
import {GeoDaState} from '@/store';
import {TableQueryComponent} from './table-query-component';
import {AddColumn} from './column-add-component';

const NO_MAP_LOADED_MESSAGE = 'Please load a map first before querying and editing data.';

function TablePanel() {
  const intl = useIntl();
  const [selectedTab, setSelectedTab] = React.useState('table-query');
  const tableName = useSelector((state: GeoDaState) => state.root.file?.rawFileData?.fileName);

  const onTabChange = (key: React.Key) => {
    if (key === 'table-query') {
      setSelectedTab('table-query');
    } else {
      setSelectedTab('table-edit');
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
        <div className="h-full overflow-y-auto  p-1">
          <Tabs
            aria-label="Options"
            variant="solid"
            color="warning"
            classNames={{}}
            size="md"
            selectedKey={selectedTab}
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
              <Card>
                <CardBody>
                  <TableQueryComponent />
                </CardBody>
              </Card>
            </Tab>
            <Tab
              key="table-edit"
              title={
                <div className="flex items-center space-x-2">
                  <span>Add Column</span>
                </div>
              }
            >
              <Card>
                <CardBody>
                  <AddColumn />
                </CardBody>
              </Card>
            </Tab>
          </Tabs>
        </div>
      )}
    </RightPanelContainer>
  );
}

export default TablePanel;
