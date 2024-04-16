import {Tabs, Tab} from '@nextui-org/react';
import {Key, useState} from 'react';
import {AddColumn} from './add-column';

export function TableEditComponent() {
  const [selectedTab, setSelectedTab] = useState('table-query');

  const onTabChange = (key: Key) => {
    if (key === 'add-column') {
      setSelectedTab('add-column');
    } else {
      setSelectedTab('update-column');
    }
  };

  return (
    <div className="flex flex-col gap-4 text-sm">
      <Tabs
        aria-label="Options"
        variant="solid"
        color="default"
        classNames={{}}
        size="md"
        selectedKey={selectedTab}
        onSelectionChange={onTabChange}
      >
        <Tab
          key="add-column"
          title={
            <div className="flex items-center space-x-2">
              <span>Add Column</span>
            </div>
          }
        >
          <AddColumn />
        </Tab>
        <Tab
          key="update-column"
          title={
            <div className="flex items-center space-x-2">
              <span>Update Column</span>
            </div>
          }
        ></Tab>
      </Tabs>
    </div>
  );
}
