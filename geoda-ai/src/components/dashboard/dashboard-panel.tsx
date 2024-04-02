import {Key, useState} from 'react';
import {
  Accordion,
  AccordionItem,
  Button,
  Select,
  SelectItem,
  Tab,
  Tabs,
  Radio,
  RadioGroup
} from '@nextui-org/react';

import {RightPanelContainer} from '../common/right-panel-template';
import {WarningBox} from '../common/warning-box';
import {getLayer} from '@/utils/data-utils';
import {useDispatch, useSelector} from 'react-redux';
import {GeoDaState} from '@/store';
import {NO_MAP_LOADED_MESSAGE} from '../chatgpt/chatgpt-component';
import {accordionItemClasses} from '../lisa/local-moran-panel';
import {generateRandomId} from '@/utils/ui-utils';
import {addTextGridItem, updateMode} from '@/actions/dashboard-actions';

// React function component DashboardPanel, returns a JSX element, which includes the following:
//   - RightPanelContainer
//    - a div element
//     - a select element "Mode" with options "Edit", "Display"
//     - a button element "Add Text"
export function DashboardPanel() {
  const dispatch = useDispatch();

  // get dashboard mode from redux store
  const dashboardMode = useSelector((state: GeoDaState) => state.root.dashboard.mode);

  const [showSettings, setShowSettings] = useState(true);

  const layer = useSelector((state: GeoDaState) => getLayer(state));

  const onModeChange = (key: string) => {
    const mode = key === 'edit' ? 'edit' : 'display';
    dispatch(updateMode(mode));
  };

  const onAddTextClick = () => {
    const id = generateRandomId();
    dispatch(addTextGridItem({id, content: null}));
  };

  const onTabChange = (key: Key) => {
    if (key === 'dashboard-settings') {
      setShowSettings(true);
    } else {
      setShowSettings(false);
    }
  };

  return (
    <RightPanelContainer
      title="Dashboard"
      description="Create and manage your dashboard"
      icon={null}
    >
      {!layer ? (
        <WarningBox message={NO_MAP_LOADED_MESSAGE} type="warning" />
      ) : (
        <div className="flex h-full flex-col gap-4 overflow-y-auto p-4">
          <div className="flex flex-row gap-4 text-sm">
            <p className="text-small text-default-600 ">Select mode</p>
            <RadioGroup
              label=""
              defaultValue="edit"
              defaultChecked={true}
              size="sm"
              orientation="horizontal"
              onValueChange={onModeChange}
            >
              <Radio value="edit">Edit</Radio>
              <Radio value="display">Display</Radio>
            </RadioGroup>
          </div>
          <Tabs
            aria-label="Options"
            variant="solid"
            color="warning"
            classNames={{}}
            size="md"
            selectedKey={showSettings ? 'dashboard-settings' : 'dashboard-widgets'}
            onSelectionChange={onTabChange}
          >
            <Tab
              key="dashboard-settings"
              title={
                <div className="flex items-center space-x-2">
                  <span>Widget Setting</span>
                </div>
              }
            ></Tab>
            <Tab
              key="dashboard-widgets"
              title={
                <div className="flex items-center space-x-2">
                  <span>Widgets Management</span>
                </div>
              }
            >
              <div className="flex flex-col gap-4 text-sm">
                <Accordion
                  defaultExpandedKeys={['1', '2']}
                  itemClasses={accordionItemClasses}
                  selectionMode="multiple"
                >
                  <AccordionItem
                    key="1"
                    aria-label="new-widgets"
                    subtitle="Add a new widget to dashboard"
                    title="New Widgets"
                  >
                    <Button
                      onClick={onAddTextClick}
                      radius="sm"
                      color="primary"
                      className="bg-blue-900"
                      size="sm"
                    >
                      Add Text Widget
                    </Button>
                  </AccordionItem>
                  <AccordionItem
                    key="2"
                    aria-label="available-widgets"
                    subtitle="Drag and drop a widget to dashboard"
                    title="Available Widgets"
                  >
                    {}
                  </AccordionItem>
                </Accordion>
              </div>
            </Tab>
          </Tabs>
        </div>
      )}
    </RightPanelContainer>
  );
}
