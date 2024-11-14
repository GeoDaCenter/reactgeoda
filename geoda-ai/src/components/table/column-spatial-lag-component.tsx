import {spatialLag} from 'geoda-wasm';
import {VariableSelector} from '@/components/common/variable-selector';
import {WeightsSelector} from '@/components/weights/weights-selector';
import {useSelector} from 'react-redux';
import {GeoDaState} from '@/store';
import {getColumnDataFromKeplerDataset} from '@/utils/data-utils';
import {useState} from 'react';
import KeplerTable from '@kepler.gl/table';
import {useDatasetFields} from '@/hooks/use-dataset-fields';
import {SharedSelection} from '@nextui-org/react';

export type SpatialLagValueProps = {
  tableName: string;
  keplerDataset: KeplerTable;
  setValues: (values: unknown | unknown[]) => void;
};

/**
 * The react component for spatial lag value
 */
export function SpatialLagValueComponent({keplerDataset, setValues}: SpatialLagValueProps) {
  const weights = useSelector((state: GeoDaState) => state.root.weights);
  const {numericFieldNames} = useDatasetFields();
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
    const values = getColumnDataFromKeplerDataset(columnName, keplerDataset);
    setVariableValues(values);
    if (neighbors) {
      updateValues(values, neighbors);
    }
  };

  // handle weights selection change
  const onWeightsSelectionChange = (value: SharedSelection) => {
    const id = value.currentKey;
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
      <VariableSelector variables={numericFieldNames} setVariable={onVariableSelectionChange} />
      <WeightsSelector weights={weights} onSelectWeights={onWeightsSelectionChange} />
    </div>
  );
}
