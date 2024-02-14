import {useIntl} from 'react-intl';
import {Select, SelectItem, Button, Spacer} from '@nextui-org/react';
import {useMemo, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';

import {GeoDaState} from '@/store';
import {MappingTypes} from '@/constants';
import {createMapBreaks, createCustomScaleMap} from '@/utils/mapping-functions';
import {WarningBox} from '../common/warning-box';
import {RightPanelContainer} from '../common/right-panel-template';
import {getColumnData, getLayer, getNumericFieldNames} from '@/utils/data-utils';

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

  // useState for number of bins
  const [k, setK] = useState(5);

  // useState for variable name
  const [variable, setVariable] = useState('');

  // useState for mapping type
  const [mappingType, setMappingType] = useState(MappingTypes.QUANTILE);

  // use selector to get tableName from redux store
  const tableName = useSelector((state: GeoDaState) => state.root.file?.rawFileData?.name);

  const layer = useSelector((state: GeoDaState) => getLayer(state));

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
        <div className="p-4">
          <div className="flex flex-col gap-2 ">
            <div className="space-y-1">
              <p className="text-small text-default-600">Map Type</p>
            </div>
            <div className="flex w-full flex-wrap gap-4 md:flex-nowrap">
              <Select label="Select map type" className="max-w" onSelectionChange={onMapTypeChange}>
                {mappingTypes.map(mappingType => (
                  <SelectItem key={mappingType.value} value={mappingType.value}>
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
          <Button radius="sm" color="primary" className="bg-rose-900" onClick={onCreateMap}>
            Create Map
          </Button>
        </div>
      )}
    </RightPanelContainer>
  );
}
