import {Button} from '@nextui-org/react';
import Typewriter from 'typewriter-effect';
import {useState} from 'react';

import {BoxPlotProps, addPlot} from '@/actions/plot-actions';
import {CustomMessagePayload} from './custom-messages';
import {HeartIcon} from '../icons/heart';
import {BoxplotOutput} from '@/ai/assistant/custom-functions';
import {BoxPlot} from '../plots/box-plot';
import {useDispatch} from 'react-redux';
import {GreenCheckIcon} from '../icons/green-check';

/**
 * Custom BoxPlot Message
 */
export const CustomBoxplotMessage = ({props}: {props: CustomMessagePayload}) => {
  const dispatch = useDispatch();
  const [hide, setHide] = useState(false);
  const {output} = props;

  const {id, variables} = output.result as BoxplotOutput['result'];
  const boxplot = output.data as BoxplotOutput['data'];

  const boxPlotProps: BoxPlotProps = {
    id,
    type: 'boxplot',
    variables,
    data: boxplot
  };

  // handle click event
  const onClick = () => {
    // dispatch action to update redux state state.root.weights
    dispatch(addPlot({id, type: 'boxplot', variables, data: boxplot, isNew: true}));
    // hide the button once clicked
    setHide(true);
  };

  return (
    <div className="h-[330px] w-full">
      <div className="h-[280px] w-full">
        <BoxPlot props={boxPlotProps} />
      </div>
      <Button
        radius="full"
        className="mt-2 w-full bg-gradient-to-tr from-pink-500 to-yellow-500 text-white shadow-none"
        onClick={onClick}
        startContent={hide ? <GreenCheckIcon /> : <HeartIcon />}
        isDisabled={hide}
      >
        <Typewriter
          options={{
            strings: `Click to Add This Box Plot`,
            autoStart: true,
            loop: false,
            delay: 10
          }}
        />
      </Button>
    </div>
  );
};
