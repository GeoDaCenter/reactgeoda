import {Button} from '@nextui-org/react';
import Typewriter from 'typewriter-effect';
import {useMemo, useState} from 'react';
import {Layer} from '@kepler.gl/layers';
import {CustomMessagePayload} from './custom-messages';
import {HeartIcon} from '../icons/heart';
import {GreenCheckIcon} from '../icons/green-check';
import {useDispatch, useSelector} from 'react-redux';
import {GeoDaState} from '@/store';
import {createCustomScaleMap} from '@/utils/mapping-functions';
import {getLayer} from '@/utils/data-utils';
import {KeplerMapContainer} from '../common/kepler-map-container';
import {reorderLayer, layerVisConfigChange} from '@kepler.gl/actions';
import {MAP_ID} from '@/constants';
import {ColorSelector} from '../common/color-selector';
import {getDefaultColorRange} from '@/utils/color-utils';
import {NaturalBreaksOutput} from '@/ai/assistant/custom-functions';
import {ColorRange} from '@kepler.gl/constants';

/**
 * Custom Map Message
 */
export const CustomMapMessage = ({props}: {props: CustomMessagePayload}) => {
  const [hide, setHide] = useState(false);

  const {functionArgs, output} = props;
  const {k, breaks} = output.result as NaturalBreaksOutput['result'];

  const dispatch = useDispatch();

  // use selector to get layer
  const layer = useSelector((state: GeoDaState) => getLayer(state));

  // use selector to get layerOrder
  const layerOrder = useSelector((state: GeoDaState) => state.keplerGl[MAP_ID].visState.layerOrder);

  // use selector to get layer
  const layers = useSelector((state: GeoDaState) => state.keplerGl[MAP_ID].visState.layers);

  // useState for selected color range
  const [selectedColorRange, setSelectedColorRange] = useState(getDefaultColorRange(k));

  const updateLayer = useMemo(() => {
    if ('type' in output && 'mapping' === output.type) {
      const {variableName} = functionArgs;
      const mappingType = output.name;
      const colorFieldName = variableName;
      const label = `${mappingType}-${colorFieldName}-${breaks.length + 1}`;
      // check if there is already a layer with the same label
      const existingLayer = layers.find((layer: Layer) => layer.config.label === label);
      if (existingLayer && selectedColorRange) {
        // update the color range in the existing layer
        const newVisCconfig = {
          ...existingLayer.config.visConfig,
          colorRange: {
            ...selectedColorRange,
            colorMap: existingLayer.config.visConfig.colorRange.colorMap.map(
              (color: any, index: number) => {
                return [color[0], selectedColorRange.colors[index]];
              }
            ),
            colorLegend: existingLayer.config.visConfig.colorRange.colorLegend.map(
              (color: any, index: number) => {
                return {...color, color: selectedColorRange.colors[index]};
              }
            )
          }
        };
        dispatch(layerVisConfigChange(existingLayer, newVisCconfig));
        return existingLayer.id;
      }
      const newLayer = createCustomScaleMap({
        breaks,
        mappingType,
        colorFieldName,
        dispatch,
        layer,
        isPreview: true,
        colorRange: selectedColorRange,
        layerOrder
      });
      return newLayer.id;
    }
    return null;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [breaks, dispatch, functionArgs, output, selectedColorRange]);

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
      <div className="h-[180px] w-full">
        {updateLayer && <KeplerMapContainer layerId={updateLayer} mapIndex={1} />}
      </div>
      <ColorSelector
        numberOfColors={k}
        defaultColorRange={selectedColorRange?.name}
        onSelectColorRange={onSelectColorRange}
      />
      <Button
        radius="full"
        className="mt-2 bg-gradient-to-tr from-pink-500 to-yellow-500 text-white shadow-none"
        onClick={onClick}
        startContent={hide ? <GreenCheckIcon /> : <HeartIcon />}
        isDisabled={hide}
      >
        <Typewriter
          options={{
            strings: `Click to Add This Map`,
            autoStart: true,
            loop: false,
            delay: 10
          }}
        />
      </Button>
    </div>
  );
};
