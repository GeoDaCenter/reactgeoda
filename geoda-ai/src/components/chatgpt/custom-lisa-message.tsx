import {useMemo, useState} from 'react';
import {ALL_FIELD_TYPES} from '@kepler.gl/constants';
import {Field} from '@kepler.gl/types';
import {addLayer, addTableColumn, reorderLayer} from '@kepler.gl/actions';

import {LisaCallbackOutput} from '@/ai/assistant/callbacks/callback-localmoran';
import {LISA_COLORS, LISA_LABELS, MAP_ID} from '@/constants';
import {createUniqueValuesMap} from '@/utils/mapping-functions';
import {useDispatch, useSelector} from 'react-redux';
import {GeoDaState} from '@/store';
import {CustomCreateButton} from '../common/custom-create-button';
import {selectKeplerDataset} from '@/store/selectors';
import {KeplerMapContainer} from '../common/kepler-map-container';
import {CustomFunctionOutputProps} from '@/ai/types';

export function isCustomLisaOutput(
  functionOutput: CustomFunctionOutputProps<unknown, unknown>
): functionOutput is LisaCallbackOutput {
  return functionOutput.type === 'lisa';
}

/**
 * Custom LISA Message
 */
export const CustomLocalMoranMessage = ({
  functionOutput,
  functionArgs
}: {
  functionOutput: LisaCallbackOutput;
  functionArgs: Record<string, any>;
}) => {
  const dispatch = useDispatch();

  const lm = functionOutput.data;
  const {datasetId, significanceThreshold, variableName, permutations} = functionOutput.result;

  // use selector to get layerOrder
  const layerOrder = useSelector((state: GeoDaState) => state.keplerGl[MAP_ID].visState.layerOrder);

  // get dataset from redux store
  const keplerDataset = useSelector(selectKeplerDataset(datasetId));

  const updateLayer = useMemo(() => {
    if (!lm) {
      return null;
    }
    // get cluster values using significant cutoff
    const clusters = lm.pValues.map((p: number, i: number) => {
      if (p > significanceThreshold) {
        return 0;
      }
      return lm.clusters[i];
    });

    // create new field
    const newFieldName = `lm_${variableName}`;
    const fieldsLength = keplerDataset.fields.length;
    const newField: Field = {
      id: newFieldName,
      name: newFieldName,
      displayName: newFieldName,
      format: '',
      type: ALL_FIELD_TYPES.integer,
      analyzerType: 'INT',
      fieldIdx: fieldsLength,
      valueAccessor: (d: any) => {
        return keplerDataset.dataContainer.valueAt(d.index, fieldsLength);
      }
    };

    // Add a new column without data first, so it can avoid error from deduceTypeFromArray()
    dispatch(addTableColumn(keplerDataset.id, newField, clusters));

    const label = `lisa_${variableName}_${permutations}`;
    // create custom scale map
    const newLayer = createUniqueValuesMap({
      dataset: keplerDataset,
      uniqueValues: [0, 1, 2, 3, 4, 5],
      hexColors: LISA_COLORS,
      legendLabels: LISA_LABELS,
      mappingType: label,
      colorFieldName: newFieldName
    });

    // dispatch to add new layer in kepler.gl
    dispatch(addLayer(newLayer, datasetId));

    // remove newLayer from layerOrder
    const otherLayers = layerOrder.filter((id: string) => id !== newLayer.id);

    // dispatch to hide the layer in the layerOrder
    dispatch(reorderLayer([...otherLayers]));

    return newLayer.id;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, functionArgs, lm]);

  const [hide, setHide] = useState(false);

  // handle click event
  const onClick = () => {
    if (!lm) {
      console.error('Local Moran data is unavailable or invalid.');
      return;
    }

    // find other layers except updateLayer
    const otherLayers = layerOrder.filter((id: string) => id !== updateLayer);
    // new order of layers
    const newOrder = [updateLayer, ...otherLayers];
    dispatch(reorderLayer(newOrder));

    // hide the button once clicked
    setHide(true);
  };

  return (
    <div className="w-full">
      {!hide && (
        <>
          <div className="pointer-events-none h-[180px] w-full">
            {updateLayer && <KeplerMapContainer layerId={updateLayer} mapIndex={1} />}
          </div>
        </>
      )}
      <CustomCreateButton onClick={onClick} hide={hide} label="Click to Add This Map" />
    </div>
  );
};
