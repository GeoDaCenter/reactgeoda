import {Button} from '@nextui-org/react';
import Typewriter from 'typewriter-effect';
import {useState} from 'react';

import {ScatterPlotProps, addPlot} from '@/actions/plot-actions';
import {CustomMessagePayload} from './custom-messages';
import {HeartIcon} from '../icons/heart';
import {ScatterplotOutput} from '@/ai/assistant/custom-functions';
import {Scatterplot} from '../plots/scatter-plot';
import {useDispatch} from 'react-redux';
import {GreenCheckIcon} from '../icons/green-check';
import {generateRandomId} from '@/utils/ui-utils';

/**
 * Custom Scatter Message
 */
export const CustomScatterplotMessage = ({props}: {props: CustomMessagePayload}) => {
  const dispatch = useDispatch();
  const [hide, setHide] = useState(false);
  const {output} = props;

  if (!output || !output.result || typeof output.result !== 'object') {
    console.error('Scatterplot data is unavailable or invalid.');
    return null;
  }

  const scatterplotData = output.result;

  if (!scatterplotData) {
    console.error('Scatterplot data is unavailable or invalid.');
    return null;
  }
  const {variableX, variableY} = output.result as ScatterplotOutput['result'];

  const scatterPlotProps: ScatterPlotProps = {
    id: generateRandomId(),
    type: 'scatter',
    variableX: variableX,
    variableY: variableY
  };

  // handle click event
  const onClick = () => {
    // dispatch action to update redux state with the new scatterplot
    dispatch(addPlot({...scatterPlotProps, isNew: true}));
    // hide the button once clicked
    setHide(true);
  };

  return (
    <div className="h-[330px] w-full">
      <div className="h-[280px] w-full">
        <Scatterplot props={scatterPlotProps} />
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
            strings: 'Click to Add This Scatterplot',
            autoStart: true,
            loop: false,
            delay: 10
          }}
        />
      </Button>
    </div>
  );
};
