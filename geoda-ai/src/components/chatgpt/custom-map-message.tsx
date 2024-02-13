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
import {reorderLayer} from '@kepler.gl/actions';
import {MAP_ID} from '@/constants';

/**
 * Custom Map Message
 */
export const CustomMapMessage = ({props}: {props: CustomMessagePayload}) => {
  const [hide, setHide] = useState(false);

  const {functionArgs, output} = props;

  const dispatch = useDispatch();

  // use selector to get layer
  const layer = useSelector((state: GeoDaState) => getLayer(state));

  // use selector to get layer
  const layers = useSelector((state: GeoDaState) => state.keplerGl[MAP_ID].visState.layers);

  const updateLayer = useMemo(() => {
    if ('mapping' === output.type) {
      const breaks = output.result as Array<number>;
      const {variableName} = functionArgs;
      const newLayer = createCustomScaleMap({
        breaks,
        mappingType: output.name,
        colorFieldName: variableName,
        dispatch,
        layer,
        isPreview: true
      });
      return newLayer.id;
    }
    return null;
  }, [dispatch, functionArgs, layer, output.name, output.result, output.type]);

  // handle click event
  const onClick = () => {
    if ('mapping' === output.type) {
      const allLayerIds = layers.map((layer: Layer) => layer.id);
      // find other layers except updateLayer
      const otherLayers = allLayerIds.filter((id: string) => id !== updateLayer);
      // new order of layers
      const newOrder = [updateLayer, ...otherLayers];
      dispatch(reorderLayer(newOrder));
    }
    // hide the button once clicked
    setHide(true);
  };

  return (
    <div className="w-60">
      {updateLayer && (
        <KeplerMapContainer layerId={updateLayer} mapIndex={1} mapWidth={280} mapHeight={180} />
      )}
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
