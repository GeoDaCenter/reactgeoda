import React, {useEffect, useMemo, useState} from 'react';
import {useIntl} from 'react-intl';
import {useSelector} from 'react-redux';
import {Tabs, Tab, Card, CardBody, Chip} from '@nextui-org/react';

import {RightPanelContainer} from '../common/right-panel-template';
import {WarningBox} from '../common/warning-box';
import {WeightsManagementComponent} from './weights-management';
import {WeightsCreationComponent} from './weights-creation';
import {GeoDaState} from '@/store';
import {MAP_ID} from '@/constants';
import {getIntegerAndStringFieldNames, getKeplerLayer} from '@/utils/data-utils';

const NO_MAP_LOADED_MESSAGE =
  'Please load a map first before creating and managing spatial weights.';

export function WeightsPanel() {
  const intl = useIntl();

  const tableName = useSelector((state: GeoDaState) => state.root.file?.rawFileData?.name);

  const visState = useSelector((state: GeoDaState) => state.keplerGl[MAP_ID].visState);

  const weights = useSelector((state: GeoDaState) => state.root.weights);

  const validFieldNames = useMemo(() => {
    const fieldNames = getIntegerAndStringFieldNames(tableName, visState);
    return fieldNames.map(fieldName => ({label: fieldName, value: fieldName}));
  }, [tableName, visState]);

  const keplerLayer = useMemo(() => {
    const layer = getKeplerLayer(tableName, visState);
    return layer;
  }, [tableName, visState]);

  const [showWeightsManagement, setShowWeightsManagement] = useState(false);
  // show weights management tabe after creating weights
  const afterCreateWeights = () => {
    // setShowWeightsManagement(true);
  };

  // monitor state.root.weights, if weights.length changed, update the tab title
  const weightsLength = weights?.length;
  useEffect(() => {
    if (weightsLength) {
      setShowWeightsManagement(true);
    }
  }, [weightsLength]);

  const onTabChange = (key: React.Key) => {
    if (key === 'weights-creation') {
      setShowWeightsManagement(false);
    } else {
      setShowWeightsManagement(true);
    }
  };

  return (
    <RightPanelContainer
      title={intl.formatMessage({
        id: 'weights.title',
        defaultMessage: 'Spatial Weights'
      })}
      description={intl.formatMessage({
        id: 'weights.description',
        defaultMessage: 'Create and manage spatial weights'
      })}
    >
      {!tableName ? (
        <WarningBox message={NO_MAP_LOADED_MESSAGE} type="warning" />
      ) : (
        <>
          <div className="flex w-full flex-col">
            <Tabs
              aria-label="Options"
              variant="solid"
              color="warning"
              classNames={{}}
              size="md"
              selectedKey={showWeightsManagement ? 'weights-management' : 'weights-creation'}
              onSelectionChange={onTabChange}
            >
              <Tab
                key="weights-creation"
                title={
                  <div className="flex items-center space-x-2">
                    <span>Weights Creation</span>
                  </div>
                }
              >
                <Card>
                  <CardBody>
                    <WeightsCreationComponent
                      validFieldNames={validFieldNames}
                      keplerLayer={keplerLayer}
                      afterCreateWeights={afterCreateWeights}
                    />
                  </CardBody>
                </Card>
              </Tab>
              <Tab
                key="weights-management"
                title={
                  <div className="flex items-center space-x-2">
                    <span>Weights Management</span>
                    {weights?.length > 0 && (
                      <Chip size="sm" variant="faded">
                        {weights.length}
                      </Chip>
                    )}
                  </div>
                }
              >
                <WeightsManagementComponent />
              </Tab>
            </Tabs>
          </div>
        </>
      )}
    </RightPanelContainer>
  );
}
