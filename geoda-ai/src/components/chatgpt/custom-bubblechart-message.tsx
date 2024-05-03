import {Button} from '@nextui-org/react';
import Typewriter from 'typewriter-effect';
import {useState} from 'react';

import {BubbleChartProps, addPlot} from '@/actions/plot-actions';
import {CustomMessagePayload} from './custom-messages';
import {HeartIcon} from '../icons/heart';
import {BubbleChartOutput} from '@/utils/custom-functions';
import {BubbleChart} from '../plots/bubble-chart-plot';
import {useDispatch} from 'react-redux';
import {GreenCheckIcon} from '../icons/green-check';

/**
 * Custom Bubble Chart Message
 */
export const CustomBubbleChartMessage = ({props}: {props: CustomMessagePayload}) => {
  const dispatch = useDispatch();
  const [hide, setHide] = useState(false);
  const {output} = props;

  if (!output || !output.result || typeof output.result !== 'object') {
    console.error('Bubble chart data is unavailable or invalid.');
    return null;
  }

  const bubbleChartData = output.result;

  if (!bubbleChartData) {
    console.error('Bubble chart data is unavailable or invalid.');
    return null;
  }
  const {variableX, variableY, variableSize, variableColor} = output.result as BubbleChartOutput['result'];

  const bubbleChartProps: BubbleChartProps = {
    id: Math.random().toString(36).substring(7),
    type: 'bubble',
    variableX: variableX,
    variableY: variableY,
    variableSize: variableSize,
    variableColor: variableColor,
    data: output.result as BubbleChartOutput['result']
  };

  // Handle click event
  const onClick = () => {
    // Dispatch action to update redux state with the new bubble chart
    dispatch(addPlot({...bubbleChartProps, isNew: true}));
    // Hide the button once clicked
    setHide(true);
  };

  return (
    <div className="h-[330px] w-full">
      <div className="h-[280px] w-full">
        <BubbleChart props={bubbleChartProps} />
      </div>
      <Button
        radius="full"
        className="mt-2 w-full bg-gradient-to-tr from-blue-500 to-green-500 text-white shadow-none"
        onClick={onClick}
        startContent={hide ? <GreenCheckIcon /> : <HeartIcon />}
        isDisabled={hide}
      >
        <Typewriter
          options={{
            strings: 'Click to Add This Bubble Chart',
            autoStart: true,
            loop: false,
            delay: 10
          }}
        />
      </Button>
    </div>
  );
};
