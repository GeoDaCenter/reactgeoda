import {ReactNode, useMemo, useState} from 'react';
import {ALL_FIELD_TYPES} from '@kepler.gl/constants';
import {Field} from '@kepler.gl/types';
import {addLayer, addTableColumn, reorderLayer} from '@kepler.gl/actions';

import {LisaCallbackOutput, LisaCallbackResult} from '@/ai/assistant/callbacks/callback-lisa';
import {MAP_ID} from '@/constants';
import {createUniqueValuesMap} from '@/utils/mapping-functions';
import {useDispatch, useSelector} from 'react-redux';
import {GeoDaState} from '@/store';
import {CustomCreateButton} from '../common/custom-create-button';
import {selectKeplerDataset} from '@/store/selectors';
import {KeplerMapContainer} from '../common/kepler-map-container';
import {CustomFunctionCall, CustomFunctionOutputProps} from 'react-ai-assist';

export function isCustomLisaOutput(
  functionOutput: CustomFunctionOutputProps<unknown, unknown>
): functionOutput is LisaCallbackOutput {
  return functionOutput.type === 'lisa';
}

export function customLisaMessageCallback({
  functionArgs,
  output
}: CustomFunctionCall): ReactNode | null {
  if (isCustomLisaOutput(output)) {
    return <CustomLisaMessage functionOutput={output} functionArgs={functionArgs} />;
  }
  return null;
}

/**
 * Custom LISA Message
 */
export const CustomLisaMessage = ({
  functionOutput,
  functionArgs
}: {
  functionOutput: LisaCallbackOutput;
  functionArgs: Record<string, any>;
}) => {
  const dispatch = useDispatch();

  const lm = functionOutput.data;
  const {
    datasetId,
    variableName,
    permutations,
    clusters: metaDataOfClusters
  } = functionOutput.result as LisaCallbackResult;

  // use selector to get layerOrder
  const layerOrder = useSelector((state: GeoDaState) => state.keplerGl[MAP_ID].visState.layerOrder);

  // get dataset from redux store
  const keplerDataset = useSelector(selectKeplerDataset(datasetId));

  const updateLayer = useMemo(() => {
    if (!lm) {
      return null;
    }

    // get unique values from clusters
    const uniqueValues = Array.from(new Set(lm.clusters));

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
    dispatch(addTableColumn(keplerDataset.id, newField, lm.clusters));

    const hexColors = metaDataOfClusters.map(cluster => cluster.color);
    const legendLabels = metaDataOfClusters.map(cluster => cluster.label);

    const label = `lisa_${variableName}_${permutations}`;
    // create custom scale map
    const newLayer = createUniqueValuesMap({
      dataset: keplerDataset,
      uniqueValues: uniqueValues,
      hexColors,
      legendLabels,
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
    <div className="mt-4 w-full">
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
