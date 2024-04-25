import React, {useMemo, useState} from 'react';
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  getKeyValue,
  Card,
  CardBody,
  Select,
  SelectItem
} from '@nextui-org/react';
import {useDispatch, useSelector} from 'react-redux';
import {GeoDaState} from '@/store';
import {WeightsMeta} from 'geoda-wasm';
import {WarningBox, WarningType} from '../common/warning-box';
import {setPropertyPanel} from '@/actions';
import {PanelName} from '../panel/panel-container';

// weightsMeta: mapping its key to descriptive label
const WeightsMetaLables: Record<string, string> = {
  id: 'ID',
  name: 'Name',
  type: 'Type',
  symmetry: 'Symmetry',
  numberOfObservations: '# Observations',
  k: 'Neigbhors',
  order: 'Order',
  incLowerOrder: 'Include Lower Order',
  threshold: 'Threshold',
  distanceMetric: 'Distance Metric',
  minNeighbors: 'Min Neighbors',
  maxNeighbors: 'Max Neighbors',
  meanNeighbors: 'Mean Neighbors',
  medianNeighbors: 'Median Neighbors',
  pctNoneZero: '% Non-Zero'
};

export function WeightsMetaTable({weightsMeta}: {weightsMeta: WeightsMeta}): React.ReactElement {
  const rows = useMemo(() => {
    const rows = Object.keys(WeightsMetaLables)
      .filter(key => key in weightsMeta)
      .map((key, i) => {
        const value = weightsMeta[key];
        // if value is a number, format it to string with 3 decimal places
        let valueString = `${value}`;
        if (typeof value === 'number') {
          if (Number.isInteger(value)) {
            valueString = `${value}`;
          } else {
            valueString = `${value.toFixed(4)}`;
          }
        }
        return {
          key: `${i}`,
          property: WeightsMetaLables[key],
          value: valueString
        };
      });
    return rows;
  }, [weightsMeta]);

  return (
    <Table aria-label="Weights Property Table" color="success" selectionMode="single">
      <TableHeader>
        <TableColumn key="property" className="bg-lime-600 text-white">
          Property
        </TableColumn>
        <TableColumn key="value" className="bg-lime-600 text-white">
          Value
        </TableColumn>
      </TableHeader>
      <TableBody emptyContent={'No rows to display.'} items={rows}>
        {item => (
          <TableRow key={item.key}>
            {columnKey => <TableCell>{getKeyValue(item, columnKey)}</TableCell>}
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}

export type WeightsSelectorProps = {
  weights: {weightsMeta: WeightsMeta}[];
  onSelectWeights: (value: any) => void;
  label?: string;
  showWarningBox?: boolean;
};

export function WeightsSelector({
  weights,
  onSelectWeights,
  label,
  showWarningBox = true
}: WeightsSelectorProps) {
  const dispatch = useDispatch();
  const [selectedWeight, setSelectedWeight] = useState<string | null>(null);

  // handle select weights
  const onSelectionChange = (value: any) => {
    const selectValue = value.currentKey;
    setSelectedWeight(selectValue);
    onSelectWeights(selectValue);
  };

  // handle warning box click
  const onWarningBoxClick = () => {
    // dispatch action to open weights panel
    dispatch(setPropertyPanel(PanelName.WEIGHTS));
  };

  return weights.length > 0 ? (
    <Select
      label={label || 'Select Spatial Weights'}
      className="max-w mb-6"
      onSelectionChange={onSelectionChange}
      selectedKeys={[selectedWeight ?? weights[weights.length - 1].weightsMeta.id ?? '']}
    >
      {weights.map(({weightsMeta}, i) => (
        <SelectItem key={weightsMeta.id ?? i} value={weightsMeta.id}>
          {weightsMeta.id}
        </SelectItem>
      ))}
    </Select>
  ) : (
    showWarningBox && (
      <WarningBox
        message={'No Spatial Weights'}
        type={WarningType.WARNING}
        onClick={onWarningBoxClick}
      />
    )
  );
}

/**
 * WeightsManagementComponent
 * @component
 * @description Component for managing spatial weights
 */
export function WeightsManagementComponent() {
  const [selectedWeight, setSelectedWeight] = useState<string | null>(null);

  const weights = useSelector((state: GeoDaState) => state.root.weights);

  // create rows from weightsMeta using useMemo
  const weightsMeta = useMemo(() => {
    if (weights && weights.length > 0) {
      // find weights using selectedWeight
      const {weightsMeta} =
        weights.find(({weightsMeta}) => weightsMeta.id === selectedWeight) ??
        weights[weights.length - 1];

      return weightsMeta;
    }
    return null;
  }, [selectedWeight, weights]);

  // handle select weights
  const onSelectWeights = (value: any) => {
    const selectValue = value.currentKey;
    setSelectedWeight(selectValue);
  };

  return (
    <Card>
      <CardBody>
        {weights?.length > 0 ? (
          <>
            <WeightsSelector weights={weights} onSelectWeights={onSelectWeights} />
            {weightsMeta && <WeightsMetaTable weightsMeta={weightsMeta} />}
          </>
        ) : (
          <p className="text-small">No Spatial Weights</p>
        )}
      </CardBody>
    </Card>
  );
}
