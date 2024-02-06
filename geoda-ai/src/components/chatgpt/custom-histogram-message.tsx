import {Button} from '@nextui-org/react';
import Typewriter from 'typewriter-effect';
import {useState} from 'react';

import {HistogramPlotProps, addPlot} from '@/actions/plot-actions';
import {CustomMessagePayload} from './custom-messages';
import {HeartIcon} from '../icons/heart';
import {HistogramOutput} from '@/utils/custom-functions';
import {HistogramPlot} from '../plots/histogram-plot';
import {useDispatch} from 'react-redux';

/**
 * Custom Histogram Message
 */
export const CustomHistogramMessage = ({props}: {props: CustomMessagePayload}) => {
  const dispatch = useDispatch();
  const [hide, setHide] = useState(false);
  const {output} = props;

  const {id, variableName, histogram} = output.result as HistogramOutput['result'];

  const histogramPlotProps: HistogramPlotProps = {
    id,
    type: 'histogram',
    variable: variableName,
    data: histogram
  };

  // handle click event
  const onClick = () => {
    // dispatch action to update redux state state.root.weights
    dispatch(addPlot({id, type: 'histogram', variable: variableName, data: histogram}));
    // hide the button once clicked
    setHide(true);
  };

  return (
    <div className="w-60">
      {<HistogramPlot props={histogramPlotProps} />}
      {!hide && (
        <Button
          radius="full"
          className="mt-2 bg-gradient-to-tr from-pink-500 to-yellow-500 text-white shadow-none"
          onClick={onClick}
          startContent={<HeartIcon />}
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
      )}
    </div>
  );
};
