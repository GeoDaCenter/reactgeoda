import {useSelector} from 'react-redux';
import {RightPanelContainer} from '../common/right-panel-template';
import {datasetsSelector} from '@/store/selectors';
import {WarningBox, WarningType} from '../common/warning-box';
import React from 'react';
import {Card, CardBody, Tab, Tabs} from '@nextui-org/react';
import {SpatialCountPanel} from './spatial-count-panel';

export function SpatialJoinPanel() {
  const datasets = useSelector(datasetsSelector);

  return (
    <RightPanelContainer
      title="Spatial Join"
      description="Apply spatial count, assign and dissolve operations."
    >
      {datasets?.length < 2 ? (
        <WarningBox
          message="Please load at least two datasets to perform spatial count."
          type={WarningType.WARNING}
        />
      ) : (
        <div className="flex h-full w-full flex-col overflow-y-auto p-4">
          <Tabs aria-label="spatial-join" variant="solid" color="danger" classNames={{}} size="md">
            <Tab key="spatial-count" title="Spatial Count">
              <Card>
                <CardBody>
                  <SpatialCountPanel />
                </CardBody>
              </Card>
            </Tab>
            <Tab key="spatial-assign" title="Spatial Assign">
              <Card>
                <CardBody>
                  <div>Content</div>
                </CardBody>
              </Card>
            </Tab>
            <Tab key="spatial-dissolve" title="Spatial Dissolve">
              <Card>
                <CardBody>
                  <div>Content</div>
                </CardBody>
              </Card>
            </Tab>
          </Tabs>
        </div>
      )}
    </RightPanelContainer>
  );
}
