import {useIntl} from 'react-intl';
import {Select, SelectItem, Button, Tabs, Tab, Card, CardBody, Spacer} from '@nextui-org/react';
import {useMemo, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {
  appInjector,
  LayerListFactory,
  makeGetActionCreators,
  MapManagerFactory,
  ColorPalette
} from '@kepler.gl/components';
import {LayerClasses} from '@kepler.gl/layers';
import {GeoDaState} from '@/store';
import {MAP_ID, MappingTypes} from '@/constants';
import {createMapBreaks, createCustomScaleMap} from '@/utils/mapping-functions';
import {WarningBox, WarningType} from '../common/warning-box';
import {RightPanelContainer} from '../common/right-panel-template';
import {getColumnData, getLayer, getNumericFieldNames} from '@/utils/data-utils';
import {wrapTo} from '@kepler.gl/actions';
import {SIDEBAR_PANELS, COLOR_RANGES, ColorRange} from '@kepler.gl/constants';

// const MapContainer = KeplerInjector.get(MapContainerFactory);
const LayerList = appInjector.get(LayerListFactory);
const MapManager = appInjector.get(MapManagerFactory);

const NO_MAP_LOADED_MESSAGE = 'Please load a map first before creating and managing your maps.';

export const mappingTypes = [
  {
    label: 'Quantile Map',
    value: MappingTypes.QUANTILE
  },
  {
    label: 'Natural Breaks Map',
    value: MappingTypes.NATURAL_BREAK
  },
  {
    label: 'Equal Interval Map',
    value: MappingTypes.EQUAL_INTERVAL
  },
  {
    label: 'Percentile Map',
    value: MappingTypes.PERCENTILE
  },
  {
    label: 'Box Map (Hinge=1.5)',
    value: MappingTypes.BOX_MAP_15
  },
  {
    label: 'Box Map (Hinge=3.0)',
    value: MappingTypes.BOX_MAP_30
  },
  {
    label: 'Standard Deviation Map',
    value: MappingTypes.STD_MAP
  },
  {
    label: 'Unique Values Map',
    value: MappingTypes.UNIQUE_VALUES
  },
  {
    label: 'Co-location Map',
    value: MappingTypes.COLOCATION
  },
  {
    label: 'Raw Rate Map',
    value: MappingTypes.RAW_RATE
  },
  {
    label: 'Excess Rate Map',
    value: MappingTypes.EXCESS_RATE
  },
  {
    label: 'Empirical Bayes Map',
    value: MappingTypes.EB_MAP
  },
  {
    label: 'Spatial Rate Map',
    value: MappingTypes.SPATIAL_RATE
  },
  {
    label: 'Spatial Empirical Bayes Map',
    value: MappingTypes.SPATIAL_EB_MAP
  }
];

// create an array from 2 to 20
const defaultBins = Array.from({length: 19}, (_, i) => i + 2).map(i => ({
  label: `${i}`,
  value: i
}));

export function MappingPanel() {
  const intl = useIntl();
  const dispatch = useDispatch();

  // get kepler actions
  const dispatchKepler = (action: any) => dispatch(wrapTo(MAP_ID, action));
  const keplerActionSelector = makeGetActionCreators();
  const keplerOwnProps = {};
  const {visStateActions, uiStateActions, mapStyleActions} = keplerActionSelector(
    dispatchKepler,
    keplerOwnProps
  );

  // useState for number of bins
  const [k, setK] = useState(5);

  // useState for variable name
  const [variable, setVariable] = useState('');

  // useState for mapping type
  const [mappingType, setMappingType] = useState(MappingTypes.QUANTILE);

  // useState for color ranges
  const [colorRanges, setColorRanges] = useState(
    COLOR_RANGES.filter(colorRange => {
      return colorRange.colors.length === k;
    })
  );

  // useState for selected color range
  const [selectedColorRange, setSelectedColorRange] = useState(colorRanges[0]);

  // use selector to get tableName from redux store
  const tableName = useSelector((state: GeoDaState) => state.root.file?.rawFileData?.fileName);

  const layer = useSelector((state: GeoDaState) => getLayer(state));

  // get datasets from redux store
  const datasets = useSelector((state: GeoDaState) => state.keplerGl[MAP_ID]?.visState?.datasets);
  const layers = useSelector((state: GeoDaState) => state.keplerGl[MAP_ID]?.visState?.layers);
  const layerOrder = useSelector(
    (state: GeoDaState) => state.keplerGl[MAP_ID]?.visState?.layerOrder
  );

  // get mapStyle from redux store
  const mapStyle = useSelector((state: GeoDaState) => state.keplerGl[MAP_ID]?.mapStyle);

  // get numeric columns from redux store
  const numericColumns = useMemo(() => {
    const fieldNames = getNumericFieldNames(layer);
    return fieldNames;
  }, [layer]);

  // handle map type change
  const onMapTypeChange = (value: any) => {
    const selectValue = value.currentKey;
    setMappingType(selectValue);
  };

  // handle number of bins change
  const onKSelectionChange = (value: any) => {
    const kValue = Number(value.currentKey);
    // convert string to number
    setK(kValue);
    // update color range
    const newColorRanges = COLOR_RANGES.filter(colorRange => {
      return colorRange.colors.length === kValue;
    });
    setColorRanges(newColorRanges);
  };

  // handle variable change
  const onVariableSelectionChange = (value: any) => {
    const selectValue = value.currentKey;
    setVariable(selectValue);
  };

  // handle color range selection change
  const onSelectColorRange = (p: ColorRange) => {
    setSelectedColorRange(p);
  };

  // handle onCreateMap
  const onCreateMap = async () => {
    if (!tableName) {
      return;
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
          <Tabs
            aria-label="Options"
            variant="solid"
            color="warning"
            classNames={{}}
            size="md"
            // selectedKey={showPlotsManagement ? 'plot-management' : 'histogram-creation'}
            // onSelectionChange={onTabChange}
          >
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
                    <Select
                      label="Select map type"
                      className="max-w"
                      onSelectionChange={onMapTypeChange}
                      defaultSelectedKeys={[mappingType]}
                    >
                      {mappingTypes.map(mappingType => (
                        <SelectItem key={mappingType.value} value={mappingType.value}>
                          {mappingType.label}
                        </SelectItem>
                      ))}
                    </Select>
                    <Select
                      label="Select number of bins"
                      className="max-w"
                      onSelectionChange={onKSelectionChange}
                      defaultSelectedKeys={[`${k}`]}
                    >
                      {defaultBins.map(bin => (
                        <SelectItem key={bin.value} value={bin.value}>
                          {bin.label}
                        </SelectItem>
                      ))}
                    </Select>
                    <Select
                      label="Select variable"
                      className="max-w"
                      onSelectionChange={onVariableSelectionChange}
                    >
                      {numericColumns.map((col: string) => (
                        <SelectItem key={col} value={col}>
                          {col}
                        </SelectItem>
                      ))}
                    </Select>
                    <Select
                      label="Select color scheme"
                      className="max-w"
                      items={colorRanges}
                      renderValue={items => {
                        return items.map(item => (
                          <ColorPalette
                            key={item.data?.name}
                            colors={item.data?.colors || []}
                            isReversed={false}
                            isSelected={item.data?.name === selectedColorRange.name}
                          />
                        ));
                      }}
                      defaultSelectedKeys={[`${selectedColorRange.name}`]}
                    >
                      {colorRange => (
                        <SelectItem
                          key={`${colorRange.name}`}
                          onClick={() => onSelectColorRange(colorRange)}
                          className="gap-0 py-0"
                        >
                          <ColorPalette
                            colors={colorRange.colors}
                            isReversed={false}
                            isSelected={colorRange.name === selectedColorRange.name}
                          />
                        </SelectItem>
                      )}
                    </Select>
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
