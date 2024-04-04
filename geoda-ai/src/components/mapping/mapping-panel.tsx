import {useIntl} from 'react-intl';
import {Select, SelectItem, Button, Tabs, Tab, Card, CardBody} from '@nextui-org/react';
import {useMemo, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {themeLT, theme} from '@kepler.gl/styles';
import {appInjector, LayerListFactory, makeGetActionCreators} from '@kepler.gl/components';
import {LayerClasses} from '@kepler.gl/layers';
import {GeoDaState} from '@/store';
import {MAP_ID, MappingTypes} from '@/constants';
import {createMapBreaks, createCustomScaleMap} from '@/utils/mapping-functions';
import {WarningBox} from '../common/warning-box';
import {RightPanelContainer} from '../common/right-panel-template';
import {getColumnData, getLayer, getNumericFieldNames} from '@/utils/data-utils';
import {wrapTo} from '@kepler.gl/actions';

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

  // get LayerManager component from appInjector
  const LayerList = appInjector.get(LayerListFactory);

  // get kepler actions
  const dispatchKepler = (action: any) => dispatch(wrapTo(MAP_ID, action));
  const keplerActionSelector = makeGetActionCreators();
  const keplerOwnProps = {};
  const {visStateActions, uiStateActions} = keplerActionSelector(dispatchKepler, keplerOwnProps);

  // useState for number of bins
  const [k, setK] = useState(5);

  // useState for variable name
  const [variable, setVariable] = useState('');

  // useState for mapping type
  const [mappingType, setMappingType] = useState(MappingTypes.QUANTILE);

  // use selector to get tableName from redux store
  const tableName = useSelector((state: GeoDaState) => state.root.file?.rawFileData?.fileName);

  const layer = useSelector((state: GeoDaState) => getLayer(state));

  const uiTheme = useSelector((state: any) => state.root.uiState.theme);

  // get datasets from redux store
  const datasets = useSelector((state: GeoDaState) => state.keplerGl[MAP_ID]?.visState?.datasets);
  const layers = useSelector((state: GeoDaState) => state.keplerGl[MAP_ID]?.visState?.layers);
  const layerOrder = useSelector(
    (state: GeoDaState) => state.keplerGl[MAP_ID]?.visState?.layerOrder
  );

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
    const selectValue = value.currentKey;
    // convert string to number
    setK(Number(selectValue));
  };

  // handle variable change
  const onVariableSelectionChange = (value: any) => {
    const selectValue = value.currentKey;
    setVariable(selectValue);
  };

  // handle onCreateMap
  const onCreateMap = async () => {
    if (!tableName) return;

    // get column data from dataContainer
    const columnData = getColumnData(variable, layer.dataContainer);

    // run quantile breaks
    const breaks = await createMapBreaks(mappingType, k, columnData);

    // create custom scale map
    createCustomScaleMap({
      breaks,
      mappingType,
      colorFieldName: variable,
      dispatch,
      layer
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
        <WarningBox message={NO_MAP_LOADED_MESSAGE} type="warning" />
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
                    <Button
                      radius="sm"
                      color="primary"
                      className="bg-rose-900"
                      onClick={onCreateMap}
                    >
                      Add Map Layer
                    </Button>
                  </div>
                </CardBody>
              </Card>
            </Tab>
            <Tab
              key="map-management"
              title={
                <div className="flex items-center space-x-2">
                  <span>Manage Map Layers</span>
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
                    theme={uiTheme === 'light' ? themeLT : theme}
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
            ></Tab>
          </Tabs>
        </div>
      )}
    </RightPanelContainer>
  );
}
