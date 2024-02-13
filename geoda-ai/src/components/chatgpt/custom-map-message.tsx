import {Button} from '@nextui-org/react';
import Typewriter from 'typewriter-effect';
import {useState} from 'react';

import {CustomMessagePayload} from './custom-messages';
import {HeartIcon} from '../icons/heart';
import {GreenCheckIcon} from '../icons/green-check';
import {useDispatch, useSelector} from 'react-redux';
import {GeoDaState} from '@/store';
import {createCustomScaleMap} from '@/utils/mapping-functions';
import {getLayer} from '@/utils/data-utils';
import KeplerMapContainer from '../common/kepler-map-container';

/**
 * Custom Map Message
 */
export const CustomMapMessage = ({props}: {props: CustomMessagePayload}) => {
  const [hide, setHide] = useState(false);
  const {functionArgs, output} = props;

  const dispatch = useDispatch();

  // use selector to get layer
  const layer = useSelector((state: GeoDaState) => getLayer(state));

  // handle click event
  const onClick = () => {
    if ('mapping' === output.type) {
      const breaks = output.result as Array<number>;
      const {variableName} = functionArgs;
      createCustomScaleMap({
        breaks,
        mappingType: output.name,
        colorFieldName: variableName,
        dispatch,
        layer
      });
    }
    // hide the button once clicked
    setHide(true);
  };

  return (
    <div className="w-60">
      <KeplerMapContainer mapIndex={0} />
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
