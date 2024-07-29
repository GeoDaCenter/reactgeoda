import {useIntl} from 'react-intl';
import {Tabs, Tab, Card, CardBody, Spacer, CardHeader} from '@nextui-org/react';
import {useMemo, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {
  appInjector,
  DndContextFactory,
  KeplerGlContext,
  LayerListFactory,
  DatasetSectionFactory,
  makeGetActionCreators,
  MapManagerFactory
} from '@kepler.gl/components';
import {LayerClasses} from '@kepler.gl/layers';
import {GeoDaState} from '@/store';
import {MAP_ID, MappingTypes} from '@/constants';
import {WarningBox, WarningType} from '../common/warning-box';
import {RightPanelContainer} from '../common/right-panel-template';
import {updateTableColor, wrapTo} from '@kepler.gl/actions';
import {SIDEBAR_PANELS} from '@kepler.gl/constants';
import {getDefaultColorRange} from '@/utils/color-utils';
import {ClassificationPanel} from '../common/classification-panel';
import {CreateButton} from '../common/create-button';
import {createMapAsync, createRatesMapAsync} from '@/actions';
import {RatesOptions} from 'geoda-wasm';
// import {DndContext} from '@dnd-kit/core';

const DatasetSection = appInjector.get(DatasetSectionFactory);
const LayerList = appInjector.get(LayerListFactory);
const MapManager = appInjector.get(MapManagerFactory);
const DndContext = appInjector.get(DndContextFactory);

const NO_MAP_LOADED_MESSAGE = 'Please load a map first before creating and managing your maps.';

function MappingPanel() {
  const intl = useIntl();
  const dispatch = useDispatch<any>();

  // get kepler actions
  const dispatchKepler = (action: any) => dispatch(wrapTo(MAP_ID, action));
  const keplerActionSelector = makeGetActionCreators();
  const keplerOwnProps = {};
  const {visStateActions, uiStateActions, mapStyleActions} = keplerActionSelector(
    dispatchKepler,
    keplerOwnProps
  );

  // get datasets from redux store
  const datasets = useSelector((state: GeoDaState) => state.keplerGl[MAP_ID]?.visState?.datasets);
  const layers = useSelector((state: GeoDaState) => state.keplerGl[MAP_ID]?.visState?.layers);
  const layerOrder = useSelector(
    (state: GeoDaState) => state.keplerGl[MAP_ID]?.visState?.layerOrder
  );

  // get mapStyle from redux store
  const mapStyle = useSelector((state: GeoDaState) => state.keplerGl[MAP_ID]?.mapStyle);

  // handle classification config changes
  const [isRatesMap, setIsRatesMap] = useState(false);
  const [k, setK] = useState(5);
  const [variable, setVariable] = useState('');
  const [baseVariable, setBaseVariable] = useState('');
  const [eventVariable, setEventVariable] = useState('');
  const [weightsId, setWeightsId] = useState('');
  const [datasetId, setDatasetId] = useState('');
  const [mappingType, setMappingType] = useState(MappingTypes.QUANTILE);
  const [selectedColorRange, setSelectedColorRange] = useState(getDefaultColorRange(k));
  const [ratesMethod, setRatesMethod] = useState(RatesOptions.RawRates);

  // handle onCreateMap
  const onCreateMap = async () => {
    if (!datasetId) {
      return;
    }

    if (isRatesMap === false) {
      dispatch(
        createMapAsync({
          dataId: datasetId,
          variable,
          classficationMethod: mappingType,
          numberOfCategories: k,
          colorRange: selectedColorRange
        })
      );
    } else if (
      eventVariable &&
      baseVariable &&
      eventVariable.length > 0 &&
      baseVariable.length > 0 &&
      ratesMethod &&
      ratesMethod.length > 0
    ) {
      dispatch(
        createRatesMapAsync({
          dataId: datasetId,
          method: ratesMethod,
          eventVariable,
          baseVariable,
          classficationMethod: mappingType,
          numberOfCategories: k,
          colorRange: selectedColorRange,
          weightsId
        })
      );
    }
  };

  const isCreateButtonDisabled = useMemo(() => {
    if (isRatesMap) {
      return !baseVariable || !eventVariable || !mappingType || k <= 0;
    }
    return !variable || !mappingType || k <= 0;
  }, [isRatesMap, baseVariable, eventVariable, variable, mappingType, k]);

  const onUpdateDatasetColor = (datasetId: string, color: string) => {
    console.log('update dataset color', datasetId, color);
    dispatch(updateTableColor(datasetId, color));
  };

  return (
    <RightPanelContainer
      title={intl.formatMessage({
        id: 'mapping.title',
        defaultMessage: 'Map'
      })}
      description={intl.formatMessage({
        id: 'mapping.description',
        defaultMessage: 'Create and manage your maps'
      })}
      icon={null}
    >
      {datasets.length === 0 ? (
        <WarningBox message={NO_MAP_LOADED_MESSAGE} type={WarningType.WARNING} />
      ) : (
        <div className="h-full overflow-y-auto p-4">
          <Tabs aria-label="Options" variant="solid" color="danger" classNames={{}} size="md">
            <Tab
              key="map-creation"
              title={
                <div className="flex items-center space-x-2">
                  <span>Add Map</span>
                </div>
              }
            >
              <Card>
                <CardBody>
                  <div className="flex flex-col gap-2">
                    <ClassificationPanel
                      props={{
                        k,
                        setK,
                        datasetId,
                        setDatasetId,
                        variable,
                        setVariable,
                        mappingType,
                        setMappingType,
                        ratesMethod,
                        setRatesMethod,
                        selectedColorRange,
                        setSelectedColorRange,
                        weightsId,
                        setWeightsId,
                        baseVariable,
                        setBaseVariable,
                        eventVariable,
                        setEventVariable,
                        setIsRatesMap
                      }}
                    />
                    <Spacer y={2} />
                    <CreateButton onClick={onCreateMap} isDisabled={isCreateButtonDisabled}>
                      Create a New Map Layer
                    </CreateButton>
                  </div>
                </CardBody>
              </Card>
            </Tab>
            <Tab
              key="map-layers"
              title={
                <div className="flex items-center space-x-2">
                  <span>Manage Maps</span>
                </div>
              }
            >
              <Card>
                <CardBody className="flex flex-col gap-4">
                  <KeplerGlContext.Provider
                    value={{id: MAP_ID, selector: state => state.keplerGl[MAP_ID]}}
                  >
                    <Card>
                      <CardBody>
                        <DatasetSection
                          datasets={datasets}
                          showDatasetTable={false}
                          showDeleteDataset={true}
                          updateTableColor={onUpdateDatasetColor}
                          removeDataset={uiStateActions.openDeleteModal}
                          showDatasetList={true}
                          showAddDataModal={uiStateActions.showAddDataModal}
                        />
                      </CardBody>
                    </Card>
                    <Card>
                      <CardHeader>
                        <p className="text-tiny tracking-[1.25px] text-[#A0A7B4] dark:text-[#6A7485]">
                          Layers
                        </p>
                      </CardHeader>
                      <CardBody>
                        <DndContext>
                          <LayerList
                            datasets={datasets}
                            layers={layers}
                            layerOrder={layerOrder}
                            layerClasses={LayerClasses}
                            uiStateActions={uiStateActions}
                            visStateActions={visStateActions}
                          />
                        </DndContext>
                      </CardBody>
                    </Card>
                  </KeplerGlContext.Provider>
                </CardBody>
              </Card>
            </Tab>
            <Tab
              key="basemap"
              title={
                <div className="flex items-center space-x-2">
                  <span>Basemap</span>
                </div>
              }
            >
              <Card>
                <CardBody>
                  <MapManager
                    mapStyle={mapStyle}
                    mapStyleActions={mapStyleActions}
                    panelMetadata={SIDEBAR_PANELS[3]}
                  />
                </CardBody>
              </Card>
            </Tab>
          </Tabs>
        </div>
      )}
    </RightPanelContainer>
  );
}

export default MappingPanel;
