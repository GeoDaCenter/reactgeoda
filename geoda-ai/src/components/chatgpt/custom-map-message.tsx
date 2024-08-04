import {useMemo, useState} from 'react';
import {Layer} from '@kepler.gl/layers';
import {CustomMessagePayload} from './custom-messages';
import {useDispatch, useSelector} from 'react-redux';
import {GeoDaState} from '@/store';
import {createCustomScaleMap, createUniqueValuesMap} from '@/utils/mapping-functions';
import {KeplerMapContainer} from '../common/kepler-map-container';
import {reorderLayer, layerVisConfigChange, addLayer} from '@kepler.gl/actions';
import {MAP_ID, MappingTypes} from '@/constants';
import {ColorSelector} from '../common/color-selector';
import {getDefaultColorRange} from '@/utils/color-utils';
import {ColorRange} from '@kepler.gl/constants';
import {CustomCreateButton} from '../common/custom-create-button';
import {MapCallbackOutput} from '@/ai/assistant/callbacks/callback-map';
import {selectKeplerDataset} from '@/store/selectors';

/**
 * Custom Map Message
 */
export const CustomMapMessage = ({props}: {props: CustomMessagePayload}) => {
  const dispatch = useDispatch();

  const {functionArgs, output} = props;
  const {
    datasetId,
    classificationMethod: mappingType,
    classificationValues
  } = output.result as MapCallbackOutput['result'];

  const k =
    mappingType === MappingTypes.UNIQUE_VALUES
      ? classificationValues.length
      : classificationValues.length + 1;

  // use selector to get layerOrder
  const layerOrder = useSelector((state: GeoDaState) => state.keplerGl[MAP_ID].visState.layerOrder);

  // use selector to get layer
  const layers = useSelector((state: GeoDaState) => state.keplerGl[MAP_ID].visState.layers);

  // useState for selected color range
  const [selectedColorRange, setSelectedColorRange] = useState(getDefaultColorRange(k));

  // get dataset from redux store
  const keplerDataset = useSelector(selectKeplerDataset(datasetId));

  const updateLayer = useMemo(() => {
    if ('type' in output && 'mapping' === output.type) {
      const {variableName} = functionArgs;
      const colorFieldName = variableName;
      const label = `${mappingType}-${colorFieldName}-${k}`;
      // check if there is already a layer with the same label
      const existingLayer = layers.find((layer: Layer) => layer.config.label === label);

      if (existingLayer && selectedColorRange) {
        // then we just need to update the color range in the existing layer
        const newVisCconfig = {
          ...existingLayer.config.visConfig,
          colorRange: {
            ...selectedColorRange,
            colorMap: existingLayer.config.visConfig.colorRange.colorMap.map(
              (color: any, index: number) => {
                return [color[0], selectedColorRange.colors[index]];
              }
            ),
            colorLegend: existingLayer.config.visConfig.colorRange.colorLegend?.map(
              (color: any, index: number) => {
                return {...color, color: selectedColorRange.colors[index]};
              }
            )
          }
        };
        dispatch(layerVisConfigChange(existingLayer, newVisCconfig));
        return existingLayer.id;
      }

      let newLayer;

      // create new layer
      if (mappingType === 'unique values') {
        newLayer = createUniqueValuesMap({
          dataset: keplerDataset,
          uniqueValues: classificationValues as number[],
          legendLabels: classificationValues.map(v => v.toString()),
          hexColors: selectedColorRange?.colors || [],
          mappingType,
          colorFieldName
        });
      } else {
        newLayer = createCustomScaleMap({
          dataset: keplerDataset,
          breaks: classificationValues as number[],
          mappingType,
          colorFieldName,
          colorRange: selectedColorRange
        });
      }

      // dispatch to add new layer in kepler.gl
      dispatch(addLayer(newLayer, datasetId));

      // remove newLayer from layerOrder
      const otherLayers = layerOrder.filter((id: string) => id !== newLayer.id);

      // dispatch to hide the layer in the layerOrder
      dispatch(reorderLayer([...otherLayers]));

      return newLayer.id;
    }
    return null;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classificationValues, dispatch, functionArgs, output, selectedColorRange]);

  const [hide, setHide] = useState(layerOrder.includes(updateLayer) || false);

  // handle click event
  const onClick = () => {
    if ('type' in output && 'mapping' === output.type) {
      // find other layers except updateLayer
      const otherLayers = layerOrder.filter((id: string) => id !== updateLayer);
      // new order of layers
      const newOrder = [updateLayer, ...otherLayers];
      dispatch(reorderLayer(newOrder));
    }
    // hide the button once clicked
    setHide(true);
  };

  // handle color range selection change
  const onSelectColorRange = (p: ColorRange) => {
    setSelectedColorRange(p);
  };

  return (
    <div className="w-full">
      {!hide && (
        <>
          <div className="pointer-events-none h-[180px] w-full">
            {updateLayer && <KeplerMapContainer layerId={updateLayer} mapIndex={1} />}
          </div>
          <ColorSelector
            numberOfColors={k}
            defaultColorRange={selectedColorRange?.name}
            onSelectColorRange={onSelectColorRange}
          />
        </>
      )}
      <CustomCreateButton onClick={onClick} hide={hide} label="Click to Add This Map" />
    </div>
  );
};
