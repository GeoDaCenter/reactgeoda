import {useIntl} from 'react-intl';
import {Button, Tabs, Tab, Card, CardBody, Spacer} from '@nextui-org/react';
import {useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {
  appInjector,
  LayerListFactory,
  makeGetActionCreators,
  MapManagerFactory
} from '@kepler.gl/components';
import {LayerClasses} from '@kepler.gl/layers';
import {GeoDaState} from '@/store';
import {MAP_ID, MappingTypes} from '@/constants';
import {createMapBreaks, createCustomScaleMap} from '@/utils/mapping-functions';
import {WarningBox, WarningType} from '../common/warning-box';
import {RightPanelContainer} from '../common/right-panel-template';
import {getColumnData, getDataset, getLayer} from '@/utils/data-utils';
import {wrapTo} from '@kepler.gl/actions';
import {SIDEBAR_PANELS} from '@kepler.gl/constants';
import {getDefaultColorRange} from '../common/color-selector';
import {ClassificationPanel, ClassificationOnValuesChange} from '../common/classification-panel';
import {useDuckDB} from '@/hooks/use-duckdb';
import {addKeplerColumn} from '@/utils/table-utils';

// const MapContainer = KeplerInjector.get(MapContainerFactory);
const LayerList = appInjector.get(LayerListFactory);
const MapManager = appInjector.get(MapManagerFactory);

const NO_MAP_LOADED_MESSAGE = 'Please load a map first before creating and managing your maps.';

export function MappingPanel() {
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
  const tableName = useSelector((state: GeoDaState) => state.root.file?.rawFileData?.fileName);
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
      await addColumnWithValues(tableName, variable, rateValues);
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

    // run map breaks
    const breaks = await createMapBreaks(mappingType, k, columnData);

    // create custom scale map in kepler.gl
    createCustomScaleMap({
      breaks,
      mappingType,
      colorFieldName: variable,
      dispatch,
      layer,
      colorRange: selectedColorRange
    });
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
          <Tabs aria-label="Options" variant="solid" color="warning" classNames={{}} size="md">
            <Tab
              key="map-creation"
              title={
                <div className="flex items-center space-x-2">
                  <span>Add Map Layer</span>
                </div>
              }
            >
              <Card>
                <CardBody>
                  <div className="flex flex-col gap-2">
                    <ClassificationPanel onValuesChange={onClassficationValueChange} />
                    <Spacer y={2} />
                    <Button
                      radius="sm"
                      color="primary"
                      className="bg-rose-900"
                      onClick={onCreateMap}
                      isDisabled={!variable || !mappingType || k <= 0}
                    >
                      Create a New Map Layer
                    </Button>
                  </div>
                </CardBody>
              </Card>
            </Tab>
            <Tab
              key="map-management"
              title={
                <div className="flex items-center space-x-2">
                  <span>Map Layers</span>
                </div>
              }
            >
              <Card>
                <CardBody>
                  <LayerList
                    datasets={datasets}
                    layers={layers}
                    layerOrder={layerOrder}
                    layerClasses={LayerClasses}
                    uiStateActions={uiStateActions}
                    visStateActions={visStateActions}
                  />
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
