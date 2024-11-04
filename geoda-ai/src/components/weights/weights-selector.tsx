import React from 'react';
import {Select, SelectItem, SharedSelection} from '@nextui-org/react';
import {WeightsMeta} from 'geoda-wasm';
import {WarningBox, WarningType} from '../common/warning-box';
import {useDispatch} from 'react-redux';
import {setPropertyPanel} from '@/actions';
import {PanelName} from '../panel/panel-container';

export type WeightsSelectorProps = {
  weights: {weightsMeta: WeightsMeta}[];
  weightsId?: string;
  onSelectWeights: (value: SharedSelection) => void;
  label?: string;
  showWarningBox?: boolean;
};

export function WeightsSelector({
  weights,
  weightsId,
  onSelectWeights,
  label,
  showWarningBox = true
}: WeightsSelectorProps) {
  const dispatch = useDispatch();

  // handle warning box click
  const onWarningBoxClick = () => {
    // dispatch action to open weights panel
    dispatch(setPropertyPanel(PanelName.WEIGHTS));
  };

  return weights.length > 0 ? (
    <Select
      label={label || 'Select Spatial Weights'}
      className="max-w mb-6"
      onSelectionChange={onSelectWeights}
      selectedKeys={[weightsId ?? weights[weights.length - 1].weightsMeta.id ?? '']}
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
