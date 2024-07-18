import {spatialLag} from 'geoda-wasm';
import {VariableSelector} from '../common/variable-selector';
import {WeightsSelector} from '../weights/weights-management';
import {useSelector} from 'react-redux';
import {GeoDaState} from '@/store';
import {getColumnData, getDataContainer} from '@/utils/data-utils';
import {MAP_ID} from '@/constants';
import {useState} from 'react';
import {mainTableNameSelector} from '@/store/selectors';

export type SpatialLagValueProps = {
  setValues: (values: unknown | unknown[]) => void;
};

/**
 * The react component for spatial lag value
 */
export function SpatialLagValueComponent({setValues}: SpatialLagValueProps) {
  const weights = useSelector((state: GeoDaState) => state.root.weights);
  // use selector to get tableName
  const tableName = useSelector(mainTableNameSelector);
  // use selector to get dataContainer
  const dataContainer = useSelector((state: GeoDaState) =>
    getDataContainer(tableName, state.keplerGl[MAP_ID].visState.datasets)
  );

  const [variableValues, setVariableValues] = useState<number[] | null>(null);
  const [neighbors, setNeighbors] = useState<number[][] | undefined>(weights?.[0]?.weights);

  // update values when variableValues and neighbors change
  const updateValues = (variableValues?: number[], selectedWeights?: number[][]) => {
    if (variableValues && selectedWeights) {
      const lagValues = spatialLag(variableValues, selectedWeights);
      setValues(lagValues);
    }
  };

  // handle variable selection change
  const onVariableSelectionChange = (columnName: string) => {
    // get values from selected variable
    const values = getColumnData(columnName, dataContainer);
    setVariableValues(values);
    if (neighbors) {
      updateValues(values, neighbors);
    }
  };

  // handle weights selection change
  const onWeightsSelectionChange = (id: string) => {
    const selectedW = weights.find(w => w.weightsMeta.id === id);
    if (selectedW) {
      setNeighbors(selectedW.weights);
      if (variableValues) {
        updateValues(variableValues, selectedW.weights);
      }
    }
  };

  return (
    <div className="flex flex-col gap-1">
      <VariableSelector setVariable={onVariableSelectionChange} />
      <WeightsSelector weights={weights} onSelectWeights={onWeightsSelectionChange} />
    </div>
  );
}
