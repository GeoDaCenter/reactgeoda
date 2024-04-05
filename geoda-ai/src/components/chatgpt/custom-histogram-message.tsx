import {Button} from '@nextui-org/react';
import Typewriter from 'typewriter-effect';
import {useState} from 'react';

import {HistogramPlotProps, addPlot} from '@/actions/plot-actions';
import {CustomMessagePayload} from './custom-messages';
import {HeartIcon} from '../icons/heart';
import {HistogramOutput} from '@/utils/custom-functions';
import {HistogramPlot} from '../plots/histogram-plot';
import {useDispatch} from 'react-redux';
import {GreenCheckIcon} from '../icons/green-check';

/**
 * Custom Histogram Message
 */
export const CustomHistogramMessage = ({props}: {props: CustomMessagePayload}) => {
  const dispatch = useDispatch();
  const [hide, setHide] = useState(false);
  const {output} = props;

  const {id, variableName} = output.result as HistogramOutput['result'];
  const histogram = output.data as HistogramOutput['data'];

  const histogramPlotProps: HistogramPlotProps = {
    id,
    type: 'histogram',
    variable: variableName,
    data: histogram
  };

  // handle click event
  const onClick = () => {
    // dispatch action to update redux state state.root.weights
    dispatch(
      addPlot({id, type: 'histogram', variable: variableName, data: histogram, isNew: true})
    );
    // hide the button once clicked
    setHide(true);
  };

  return (
    <div className="h-[330px] w-full">
      <div className="h-[280px] w-full">
        <HistogramPlot props={histogramPlotProps} />
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
            strings: `Click to Add This Histogram`,
            autoStart: true,
            loop: false,
            delay: 10
          }}
        />
      </Button>
    </div>
  );
};
