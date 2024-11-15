import {useSelector, useDispatch} from 'react-redux';
import {RightPanelContainer} from '../common/right-panel-template';
import {datasetsSelector, selectSpatialCountConfig} from '@/store/selectors';
import {WarningBox, WarningType} from '../common/warning-box';
import React from 'react';
import {Card, CardBody, Tab, Tabs} from '@nextui-org/react';
import {SpatialCountPanel} from './spatial-count-panel';
import {setAddDatasetModal} from '../../actions';
import {SpatialAssignPanel} from './spatial-assign-panel';
import {useIntl} from 'react-intl';

export function SpatialJoinPanel() {
  const dispatch = useDispatch<any>();
  const intl = useIntl();

  const datasets = useSelector(datasetsSelector);
  const spatialCountConfig = useSelector(selectSpatialCountConfig);

  const onClickWarningBox = () => {
    dispatch(setAddDatasetModal(true));
  };

  return (
    <RightPanelContainer
      title={intl.formatMessage({id: 'spatialJoin.title', defaultMessage: 'Spatial Join'})}
      description={intl.formatMessage({
        id: 'spatialJoin.description',
        defaultMessage: 'Apply spatial count, assign and dissolve operations.'
      })}
    >
      {datasets?.length < 2 ? (
        <WarningBox
          message={intl.formatMessage({
            id: 'spatialJoin.warning',
            defaultMessage: 'Please load at least two datasets to perform spatial join.'
          })}
          type={WarningType.WARNING}
          onClick={onClickWarningBox}
        />
      ) : (
        <div className="flex h-full w-full flex-col overflow-y-auto p-4">
          <Tabs aria-label="spatial-join" variant="solid" color="danger" classNames={{}} size="md">
            <Tab key="spatial-count" title="Spatial Count">
              <Card>
                <CardBody>
                  <SpatialCountPanel
                    datasets={datasets}
                    spatialCountConfig={spatialCountConfig}
                    dispatch={dispatch}
                  />
                </CardBody>
              </Card>
            </Tab>
            <Tab key="spatial-assign" title="Spatial Assign">
              <Card>
                <CardBody>
                  <SpatialAssignPanel />
                </CardBody>
              </Card>
            </Tab>
          </Tabs>
        </div>
      )}
    </RightPanelContainer>
  );
}
