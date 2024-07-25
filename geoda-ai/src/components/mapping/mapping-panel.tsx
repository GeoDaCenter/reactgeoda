import {useIntl} from 'react-intl';
import {Tabs, Tab, Card, CardBody, Spacer} from '@nextui-org/react';
import {useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {
  appInjector,
  DndContextFactory,
  KeplerGlContext,
  LayerListFactory,
  makeGetActionCreators,
  MapManagerFactory
} from '@kepler.gl/components';
import {LayerClasses} from '@kepler.gl/layers';
import {GeoDaState} from '@/store';
import {MAP_ID, MappingTypes} from '@/constants';
import {
  createMapBreaks,
  createCustomScaleMap,
  createUniqueValuesMap
} from '@/utils/mapping-functions';
import {WarningBox, WarningType} from '../common/warning-box';
import {RightPanelContainer} from '../common/right-panel-template';
import {getColumnData, getDataset, getLayer} from '@/utils/data-utils';
import {wrapTo} from '@kepler.gl/actions';
import {SIDEBAR_PANELS} from '@kepler.gl/constants';
import {getDefaultColorRange} from '@/utils/color-utils';
import {ClassificationPanel, ClassificationOnValuesChange} from '../common/classification-panel';
import {useDuckDB} from '@/hooks/use-duckdb';
import {addKeplerColumn} from '@/utils/table-utils';
import {CreateButton} from '../common/create-button';
import {mainTableNameSelector} from '@/store/selectors';
// import {DndContext} from '@dnd-kit/core';

// const MapContainer = KeplerInjector.get(MapContainerFactory);
const LayerList = appInjector.get(LayerListFactory);
const MapManager = appInjector.get(MapManagerFactory);
const DndContext = appInjector.get(DndContextFactory);

const NO_MAP_LOADED_MESSAGE = 'Please load a map first before creating and managing your maps.';

function MappingPanel() {
  const intl = useIntl();
  const dispatch = useDispatch();
  const {addColumnWithValues} = useDuckDB();

  // get kepler actions
  const dispatchKepler = (action: any) => dispatch(wrapTo(MAP_ID, action));
  const keplerActionSelector = makeGetActionCreators();
  const keplerOwnProps = {};
  const {visStateActions, uiStateActions, mapStyleActions} = keplerActionSelector(
    dispatchKepler,
    keplerOwnProps
  );

  // use selector to get tableName from redux store
  const tableName = useSelector(mainTableNameSelector);
  const layer = useSelector((state: GeoDaState) => getLayer(state));
  const dataset = useSelector((state: GeoDaState) => getDataset(state));

  // get datasets from redux store
  const datasets = useSelector((state: GeoDaState) => state.keplerGl[MAP_ID]?.visState?.datasets);
  const layers = useSelector((state: GeoDaState) => state.keplerGl[MAP_ID]?.visState?.layers);
  const layerOrder = useSelector(
    (state: GeoDaState) => state.keplerGl[MAP_ID]?.visState?.layerOrder
  );

  // get mapStyle from redux store
  const mapStyle = useSelector((state: GeoDaState) => state.keplerGl[MAP_ID]?.mapStyle);

  // handle classification config changes
  const [k, setK] = useState(5);
  const [variable, setVariable] = useState('');
  const [mappingType, setMappingType] = useState<string>(MappingTypes.QUANTILE);
  const [selectedColorRange, setSelectedColorRange] = useState(getDefaultColorRange(k));
  const [rateValues, setRateValues] = useState<number[] | undefined>(undefined);

  const onClassficationValueChange = ({
    method,
    variable,
    k,
    colorRange,
    rateValues
  }: ClassificationOnValuesChange) => {
    setMappingType(method);
    setVariable(variable);
    setK(k);
    setSelectedColorRange(colorRange);
    setRateValues(rateValues);
  };

  // handle onCreateMap
  const onCreateMap = async () => {
    if (!tableName) {
      return;
    }

    if (rateValues) {
      // in case of rate mapping, add rate values to a new column first
      await addColumnWithValues({
        tableName,
        columnName: variable,
        columnValues: rateValues,
        columnType: 'NUMERIC'
      });
      // add column to kepler.gl
      addKeplerColumn({
        dataset,
        newFieldName: variable,
        fieldType: 'real',
        columnData: rateValues,
        dispatch
      });
    }

    // get column data from dataContainer
    const columnData = getColumnData(variable, layer.dataContainer);

    if (mappingType === MappingTypes.UNIQUE_VALUES) {
      const uniqueValues = Array.from(new Set(columnData));
      const legendLabels = uniqueValues.map(v => v.toString());
      // create unique values map in kepler.gl
      createUniqueValuesMap({
        dispatch,
        layer,
        uniqueValues,
        legendLabels,
        hexColors: selectedColorRange?.colors || [],
        mappingType,
        colorFieldName: variable,
        layerOrder
      });
    } else {
      // run map breaks
      const breaks = await createMapBreaks({mappingType, k, values: columnData});

      // create custom scale map in kepler.gl
      createCustomScaleMap({
        breaks,
        mappingType,
        colorFieldName: variable,
        dispatch,
        layer,
        colorRange: selectedColorRange,
        layerOrder
      });
    }
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
      {!tableName ? (
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
                      props={{k, variable, mappingType}}
                      onValuesChange={onClassficationValueChange}
                    />
                    <Spacer y={2} />
                    <CreateButton
                      onClick={onCreateMap}
                      isDisabled={!variable || !mappingType || k <= 0}
                    >
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
                <CardBody>
                  <KeplerGlContext.Provider
                    value={{id: MAP_ID, selector: state => state.keplerGl[MAP_ID]}}
                  >
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
