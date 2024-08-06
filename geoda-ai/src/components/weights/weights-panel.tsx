import React, {useEffect, useMemo, useState} from 'react';
import {useIntl} from 'react-intl';
import {useSelector} from 'react-redux';
import {Tabs, Tab, Card, CardBody, Chip} from '@nextui-org/react';

import {RightPanelContainer} from '../common/right-panel-template';
import {WarningBox, WarningType} from '../common/warning-box';
import {WeightsManagementComponent} from './weights-management';
import {WeightsCreationComponent} from './weights-creation';
import {getIntegerAndStringFieldNamesFromDataset} from '@/utils/data-utils';
import {
  selectDefaultKeplerDataset,
  selectKeplerDataset,
  selectKeplerLayer,
  selectWeightsByDataId
} from '@/store/selectors';
import {DatasetSelector} from '../common/dataset-selector';
import {WeightsProps} from '@/reducers/weights-reducer';

const NO_MAP_LOADED_MESSAGE =
  'Please load a map first before creating and managing spatial weights.';

export function WeightsPanel() {
  const intl = useIntl();

  const defaultKeplerDataset = useSelector(selectDefaultKeplerDataset);
  const [datasetId, setDatasetId] = useState(defaultKeplerDataset?.id || '');
  const keplerDataset = useSelector(selectKeplerDataset(datasetId));
  const keplerLayer = useSelector(selectKeplerLayer(datasetId));
  const weights = useSelector(selectWeightsByDataId(datasetId));

  const validFieldNames = useMemo(() => {
    const fieldNames = keplerDataset ? getIntegerAndStringFieldNamesFromDataset(keplerDataset) : [];
    return fieldNames.map(fieldName => ({label: fieldName, value: fieldName}));
  }, [keplerDataset]);

  // check if there is any newly added weights, if there is, show weights management tab
  const newWeightsCount = weights.filter((weight: WeightsProps) => weight.isNew).length;
  const [showWeightsManagement, setShowWeightsManagement] = useState(newWeightsCount > 0);

  // reset isNew flag of weights
  useEffect(() => {
    if (newWeightsCount > 0) {
      weights.forEach((weight: WeightsProps) => {
        if (weight.isNew) {
          weight.isNew = false;
        }
      });
    }
  }, [newWeightsCount, weights]);

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
      {!keplerDataset ? (
        <WarningBox message={NO_MAP_LOADED_MESSAGE} type={WarningType.WARNING} />
      ) : (
        <div className="flex w-full flex-col p-4">
          <Tabs
            aria-label="Options"
            variant="solid"
            color="danger"
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
                <CardBody className="flex flex-col gap-4">
                  <DatasetSelector datasetId={datasetId} setDatasetId={setDatasetId} />
                  <WeightsCreationComponent
                    validFieldNames={validFieldNames}
                    keplerLayer={keplerLayer}
                    keplerDataset={keplerDataset}
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
              <DatasetSelector datasetId={datasetId} setDatasetId={setDatasetId} />
              <WeightsManagementComponent datasetId={datasetId} />
            </Tab>
          </Tabs>
        </div>
      )}
    </RightPanelContainer>
  );
}
