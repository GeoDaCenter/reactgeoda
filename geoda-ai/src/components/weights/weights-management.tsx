import React, {useMemo, useState} from 'react';
import {Card, CardBody, SharedSelection} from '@nextui-org/react';
import {WeightsProps} from '@/reducers/weights-reducer';
import {WeightsMetaTable} from './weights-meta-table';
import {WeightsSelector} from './weights-selector';

/**
 * WeightsManagementComponent
 * @component
 * @description Component for managing spatial weights
 */
export function WeightsManagementComponent({
  weights,
  selectedWeightsId
}: {
  weights: WeightsProps[];
  selectedWeightsId: string | null;
}): React.ReactElement {
  console.log('selectedWeightsId', selectedWeightsId);
  const [selectedWeight, setSelectedWeight] = useState<string | null>(selectedWeightsId);

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
  const onSelectWeights = (value: SharedSelection) => {
    const selectValue = value.currentKey;
    if (selectValue) {
      setSelectedWeight(selectValue);
    }
  };

  return (
    <Card>
      <CardBody>
        {weights?.length > 0 ? (
          <>
            <WeightsSelector
              weights={weights}
              onSelectWeights={onSelectWeights}
              weightsId={selectedWeightsId ?? undefined}
            />
            {weightsMeta && <WeightsMetaTable weightsMeta={weightsMeta} />}
          </>
        ) : (
          <p className="text-small">No Spatial Weights</p>
        )}
      </CardBody>
    </Card>
  );
}
