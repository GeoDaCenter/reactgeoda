import {useIntl} from 'react-intl';
import {Tabs, Tab, Card, CardBody, CardHeader, Badge} from '@nextui-org/react';
import {useDispatch, useSelector} from 'react-redux';
import {
  appInjector,
  DndContextFactory,
  KeplerGlContext,
  LayerListFactory,
  DatasetSectionFactory,
  makeGetActionCreators,
  MapManagerFactory,
  TooltipConfigFactory
} from '@kepler.gl/components';
import {LayerClasses} from '@kepler.gl/layers';
import {GeoDaState} from '@/store';
import {MAP_ID} from '@/constants';
import {WarningBox, WarningType} from '../common/warning-box';
import {RightPanelContainer} from '../common/right-panel-template';
import {interactionConfigChange, updateTableColor, wrapTo} from '@kepler.gl/actions';
import {SIDEBAR_PANELS} from '@kepler.gl/constants';
import {ClassificationPanel} from '../common/classification-panel';
import {RGBColor} from '@kepler.gl/types';

const DatasetSection = appInjector.get(DatasetSectionFactory);
const LayerList = appInjector.get(LayerListFactory);
const MapManager = appInjector.get(MapManagerFactory);
const DndContext = appInjector.get(DndContextFactory);
const TooltipConfig = appInjector.get(TooltipConfigFactory);

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
  const interactionConfig = useSelector(
    (state: GeoDaState) => state.keplerGl[MAP_ID]?.visState?.interactionConfig
  );
  const layerOrder = useSelector(
    (state: GeoDaState) => state.keplerGl[MAP_ID]?.visState?.layerOrder
  );

  // get mapStyle from redux store
  const mapStyle = useSelector((state: GeoDaState) => state.keplerGl[MAP_ID]?.mapStyle);

  const onUpdateDatasetColor = (datasetId: string, color: RGBColor) => {
    dispatch(updateTableColor(datasetId, color));
  };

  const onInteractionConfigChange = (newConfig: any) => {
    dispatch(
      interactionConfigChange({
        ...interactionConfig.tooltip,
        config: {
          ...interactionConfig.tooltip.config,
          ...newConfig
        }
      })
    );
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
                    <ClassificationPanel />
                  </div>
                </CardBody>
              </Card>
            </Tab>
            <Tab
              key="map-layers"
              title={
                <div className="flex items-center space-x-2">
                  <Badge
                    content={layers.length > 0 ? layers.length : ''}
                    color="danger"
                    className="right-[-10px] top-0"
                  >
                    <span>Manage Maps</span>
                  </Badge>
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
                    <Card>
                      <CardHeader>
                        <p className="text-tiny tracking-[1.25px] text-[#A0A7B4] dark:text-[#6A7485]">
                          Tooltip
                        </p>
                      </CardHeader>
                      <CardBody>
                        <TooltipConfig
                          datasets={datasets}
                          config={interactionConfig.tooltip.config}
                          onChange={onInteractionConfigChange}
                          onDisplayFormatChange={visStateActions.setColumnDisplayFormat}
                        />
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
