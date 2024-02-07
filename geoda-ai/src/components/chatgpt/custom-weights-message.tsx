import {WeightsMeta} from 'geoda-wasm';
import {Button} from '@nextui-org/react';
import Typewriter from 'typewriter-effect';
import {useState} from 'react';

import {addWeights} from '@/actions';
import {CustomMessagePayload} from './custom-messages';
import {HeartIcon} from '../icons/heart';
import {useDispatch} from 'react-redux';

/**
 * Custom Weights Message
 */
export const CustomWeightsMessage = ({props}: {props: CustomMessagePayload}) => {
  const [hide, setHide] = useState(false);
  const {output} = props;
  const dispatch = useDispatch();

  const weights = output.data as number[][];
  const weightsMeta: WeightsMeta = output.result as WeightsMeta;

  // handle click event
  const onClick = () => {
    // dispatch action to update redux state state.root.weights
    dispatch(addWeights({weights, weightsMeta, isNew: true}));
    // hide the button once clicked
    setHide(true);
  };

  return (
    <div className="w-60">
      {/* <WeightsMetaTable weightsMeta={output.data as WeightsMeta} /> */}
      {!hide && (
        <Button
          radius="full"
          className="mt-2 bg-gradient-to-tr from-pink-500 to-yellow-500 text-white shadow-none"
          onClick={onClick}
          startContent={<HeartIcon />}
        >
          <Typewriter
            options={{
              strings: `Click to Add This Spatial Weights`,
              autoStart: true,
              loop: false,
              delay: 10
            }}
          />
        </Button>
      )}
    </div>
  );
};
