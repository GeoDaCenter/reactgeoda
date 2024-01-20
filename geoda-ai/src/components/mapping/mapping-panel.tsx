import {useIntl} from 'react-intl';
import {Select, SelectItem, Button, Spacer} from '@nextui-org/react';

import {useState} from 'react';
import colorbrewer from 'colorbrewer';
import {useDispatch, useSelector} from 'react-redux';
import {DataContainerInterface} from '@kepler.gl/utils';
import {addLayer, reorderLayer} from '@kepler.gl/actions';

import {GeoDaState} from '@/store';
import {WarningBox} from '../common/warning-box';
import {MAP_ID} from '@/constants';
import {useGeoDa} from '@/hooks/use-geoda';
import {RightPanelContainer} from '../common/right-panel-template';

const NO_MAP_LOADED_MESSAGE = 'Please load a map first before creating a thematic map.';

const mappingTypes = [
  {
    label: 'Quantile Map',
    value: 'quantile'
  },
  {
    label: 'Natural Breaks Map',
    value: 'natural-break'
  },
  {
    label: 'Equal Interval Map',
    value: 'equal-interval'
  },
  {
    label: 'Percentile Map',
    value: 'percentile'
  },
  {
    label: 'Box Map (Hinge=1.5)',
    value: 'box-map-15'
  },
  {
    label: 'Box Map (Hinge=3.0)',
    value: 'box-map-30'
  },
  {
    label: 'Standard Deviation Map',
    value: 'std-map'
  },
  {
    label: 'Unique Values Map',
    value: 'unique-values'
  },
  {
    label: 'Co-location Map',
    value: 'colocation'
  },
  {
    label: 'Raw Rate Map',
    value: 'raw-rate'
  },
  {
    label: 'Excess Rate Map',
    value: 'excess-rate'
  },
  {
    label: 'Empirical Bayes Map',
    value: 'eb-map'
  },
  {
    label: 'Spatial Rate Map',
    value: 'spatial-rate'
  },
  {
    label: 'Spatial Empirical Bayes Map',
    value: 'spatial-eb-map'
  }
];

const defaultBins = [
  {
    label: '2',
    value: 2
  },
  {
    label: '3',
    value: 3
  },
  {
    label: '4',
    value: 4
  },
  {
    label: '5',
    value: 5
  },
  {
    label: '6',
    value: 6
  },
  {
    label: '7',
    value: 7
  },
  {
    label: '8',
    value: 8
  },
  {
    label: '9',
    value: 9
  },
  {
    label: '10',
    value: 10
  }
];

export function MappingPanel() {
  const intl = useIntl();

  // useState for number of bins
  const [k, setK] = useState(5);

  // useState for variable name
  const [variable, setVariable] = useState('');

  // useState for mapping type
  const [mappingType, setMappingType] = useState('Quantile');

  // use geoda hooks
  const {runQuantileBreaks} = useGeoDa();

  const dispatch = useDispatch();
  const geodaState = useSelector((state: GeoDaState) => state);

  const tableName = useSelector((state: GeoDaState) => state.root.file?.rawFileData?.name);

  // get numeric columns from redux store
  const numericColumns = useSelector((state: GeoDaState) => {
    if (!tableName) return [];

    // get kepler.gl layer using tableName
    const layer = state.keplerGl[MAP_ID].visState.layers.find((layer: any) =>
      tableName.startsWith(layer.config.label)
    );
    // get numeric columns from layer
    const columnNames: string[] = [];
    const dataContainer: DataContainerInterface = layer.dataContainer;
    for (let i = 0; i < dataContainer.numColumns(); i++) {
      const field = dataContainer.getField?.(i);
      if (field && (field.type === 'real' || field.type === 'integer')) {
        columnNames.push(field.name);
      }
    }
    return columnNames;
  });

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

    // get dataContainer
    const layer = geodaState.keplerGl[MAP_ID].visState.layers.find((layer: any) =>
      tableName.startsWith(layer.config.label)
    );
    const dataContainer: DataContainerInterface = layer.dataContainer;

    // get column index from dataContainer
    let columnIndex = -1;
    for (let i = 0; i < dataContainer.numColumns(); i++) {
      const field = dataContainer.getField?.(i);
      if (field && field.name === variable) {
        columnIndex = i;
        break;
      }
    }

    // get column data from dataContainer
    const columnData = dataContainer.column ? [...dataContainer.column(columnIndex)] : [];
    if (!Array.isArray(columnData) || columnData.some(item => typeof item !== 'number')) {
      // handle error
      return;
    }

    // run quantile breaks
    const breaks = await runQuantileBreaks(k, columnData);

    const hexColors = colorbrewer.YlOrBr[breaks.length + 1];
    const colors = hexColors.map(color => `#${color.match(/[0-9a-f]{2}/g)?.join('')}`);
    const colorLegend = colors.map((color, index) => ({
      color,
      legend: `${breaks[index]}`
    }));
    const colorMap = colors.map((color, index) => {
      return [breaks[index], color];
    });

    const colorRange = {
      category: 'custom',
      type: 'diverging',
      name: 'ColorBrewer RdBu-5',
      colors,
      colorMap,
      colorLegend
    };
    // get dataId
    const dataId = layer.config.dataId;
    // generate random id
    const id = Math.random().toString(36).substring(7);
    const newLayer = {
      id,
      type: 'geojson',
      config: {
        dataId,
        columns: {geojson: layer.config.columns.geojson.value},
        label: `${mappingType} Map`,
        colorScale: 'custom',
        colorField: {
          name: `${variable}`,
          type: 'real'
        },
        visConfig: {
          ...layer.config.visConfig,
          colorRange,
          colorDomain: breaks
        },
        isVisible: true
      }
    };
    // dispatch action to add new layer in kepler
    dispatch(addLayer(newLayer, dataId));
    // dispatch action to reorder layer
    const existingLayerIds = geodaState.keplerGl[MAP_ID].visState.layers.map(
      (layer: any) => layer.id
    );
    dispatch(reorderLayer([newLayer.id, ...existingLayerIds]));
  };

  return (
    <RightPanelContainer
      title={intl.formatMessage({
        id: 'mapping.title',
        defaultMessage: 'Mapping'
      })}
      description={intl.formatMessage({
        id: 'mapping.description',
        defaultMessage: 'Create a thematic map'
      })}
    >
      {!tableName ? (
        <WarningBox message={NO_MAP_LOADED_MESSAGE} type="warning" />
      ) : (
        <>
          <div className="flex flex-col gap-2 ">
            <div className="space-y-1">
              <p className="text-small text-default-600">Map Type</p>
            </div>
            <div className="flex w-full flex-wrap gap-4 md:flex-nowrap">
              <Select label="Select map type" className="max-w">
                {mappingTypes.map(mappingType => (
                  <SelectItem
                    key={mappingType.value}
                    value={mappingType.value}
                    onSelectionChange={onMapTypeChange}
                  >
                    {mappingType.label}
                  </SelectItem>
                ))}
              </Select>
            </div>
            <div className="space-y-1">
              <p className="text-small text-default-600">Number of Bins</p>
            </div>
            <div className="flex w-full flex-wrap gap-4 md:flex-nowrap">
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
            </div>
            <div className="space-y-1">
              <p className="text-small text-default-600">Variable</p>
            </div>
            <div className="flex w-full flex-wrap gap-4 md:flex-nowrap">
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
            </div>
          </div>
          <Spacer y={8} />
          <Button color="primary" className="bg-rose-900" onClick={onCreateMap}>
            Create Map
          </Button>
        </>
      )}
    </RightPanelContainer>
  );
}
