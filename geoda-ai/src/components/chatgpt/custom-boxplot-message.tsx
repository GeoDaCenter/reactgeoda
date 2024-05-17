import {Button} from '@nextui-org/react';
import Typewriter from 'typewriter-effect';
import {useState} from 'react';

import {BoxPlotProps, addPlot} from '@/actions/plot-actions';
import {CustomMessagePayload} from './custom-messages';
import {HeartIcon} from '../icons/heart';
import {BoxplotOutput} from '@/ai/assistant/custom-functions';
import {BoxPlot} from '../plots/box-plot';
import {useDispatch, useSelector} from 'react-redux';
import {GreenCheckIcon} from '../icons/green-check';
import {GeoDaState} from '@/store';

/**
 * Custom BoxPlot Message
 */
export const CustomBoxplotMessage = ({props}: {props: CustomMessagePayload}) => {
  const dispatch = useDispatch();
  const {output} = props;

  if (!('data' in output)) {
    console.error('Boxplot data is unavailable or invalid.');
    return null;
  }

  const {id, variables} = output.result as BoxplotOutput['result'];
  const boxplot = output.data as BoxplotOutput['data'];

  const boxPlotProps: BoxPlotProps = {
    id,
    type: 'boxplot',
    variables,
    data: boxplot
  };

  // get plot from redux store
  const plot = useSelector((state: GeoDaState) => state.root.plots.find(p => p.id === id));
  const [hide, setHide] = useState(Boolean(plot) || false);

  // handle click event
  const onClick = () => {
    // dispatch action to update redux state state.root.weights
    dispatch(addPlot({id, type: 'boxplot', variables, data: boxplot, isNew: true}));
    // hide the button once clicked
    setHide(true);
  };

  return (
    <div className="w-full">
      {!hide && (
        <div className="h-[280px] w-full">
          <BoxPlot props={boxPlotProps} />
        </div>
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
