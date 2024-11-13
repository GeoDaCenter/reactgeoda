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
  selectDefaultWeightsId,
  selectKeplerDataset,
  selectKeplerLayer,
  selectWeightsByDataId
} from '@/store/selectors';
import {DatasetSelector} from '../common/dataset-selector';
import {WeightsProps} from '@/reducers/weights-reducer';
import {GeoDaState} from '@/store';

export function WeightsPanel() {
  const intl = useIntl();

  const defaultKeplerDataset = useSelector(selectDefaultKeplerDataset);
  const defaultWeightsId = useSelector(selectDefaultWeightsId);
  const [datasetId, setDatasetId] = useState(defaultKeplerDataset?.id || '');

  const keplerDataset = useSelector(selectKeplerDataset(datasetId));
  const keplerLayer = useSelector(selectKeplerLayer(datasetId));
  const weights = useSelector(selectWeightsByDataId(datasetId));
  const weightsCreation = useSelector((state: GeoDaState) => state.root.uiState.weights);

  const validFieldNames = useMemo(() => {
    const fieldNames = keplerDataset ? getIntegerAndStringFieldNamesFromDataset(keplerDataset) : [];
    return fieldNames.map(fieldName => ({label: fieldName, value: fieldName}));
  }, [keplerDataset]);

  // check if there is any newly added weights, if there is, show weights management tab
  const newWeightsCount = weights.filter((weight: WeightsProps) => weight.isNew).length;
  const [showWeightsManagement, setShowWeightsManagement] = useState(
    newWeightsCount > 0 || weightsCreation.showWeightsPanel
  );

  // reset isNew flag of weights after switching to weights management tab
  useEffect(() => {
    if (newWeightsCount > 0) {
      weights.forEach((weight: WeightsProps) => {
        if (weight.isNew) {
          weight.isNew = false;
        }
      });
    }
  }, [newWeightsCount, weights]);

  // show weights management tab if weights added from chatbot
  useEffect(() => {
    if (defaultWeightsId || weights.length > 0) {
      setShowWeightsManagement(true);
    }
  }, [defaultWeightsId, weights.length]);

  const onTabChange = (key: React.Key) => {
    if (key === 'weights-creation') {
      setShowWeightsManagement(false);
    } else {
      setShowWeightsManagement(true);
    }
  };

  const onWeightsCreated = () => {
    setShowWeightsManagement(true);
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
        <WarningBox
          message={intl.formatMessage({
            id: 'weights.noMap',
            defaultMessage: 'Please load a map first before creating and managing spatial weights.'
          })}
          type={WarningType.WARNING}
        />
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
                  <span>
                    {intl.formatMessage({
                      id: 'weights.creation.title',
                      defaultMessage: 'Weights Creation'
                    })}
                  </span>
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
                    weightsData={weights}
                    onWeightsCreated={onWeightsCreated}
                  />
                </CardBody>
              </Card>
            </Tab>
            <Tab
              key="weights-management"
              title={
                <div className="flex items-center space-x-2">
                  <span>
                    {intl.formatMessage({
                      id: 'weights.management.title',
                      defaultMessage: 'Weights Management'
                    })}
                  </span>
                  {weights?.length > 0 && (
                    <Chip size="sm" variant="faded">
                      {weights.length}
                    </Chip>
                  )}
                </div>
              }
            >
              <DatasetSelector datasetId={datasetId} setDatasetId={setDatasetId} />
              <WeightsManagementComponent
                weights={weights}
                selectedWeightsId={defaultWeightsId || null}
              />
            </Tab>
          </Tabs>
        </div>
      )}
    </RightPanelContainer>
  );
}
