import {Button} from '@nextui-org/react';
import Typewriter from 'typewriter-effect';
import {useState} from 'react';

import {ScatterPlotProps, addPlot} from '@/actions/plot-actions';
import {CustomMessagePayload} from './custom-messages';
import {HeartIcon} from '../icons/heart';
import {ScatterplotOutput} from '@/utils/custom-functions';
import {Scatterplot} from '../plots/scat-plot';
import {useDispatch} from 'react-redux';

/**
 * Custom Scatter Message
 */
export const CustomScatterplotMessage = ({props}: {props: CustomMessagePayload}) => {
  const dispatch = useDispatch();
  const [hide, setHide] = useState(false);
  const {output} = props;

  if (!output.data || !Array.isArray(output.data) || output.data.length === 0) {
    console.error('Scatterplot data is unavailable or invalid.');
    return null;
  }

  const scatterplotData = output.data[0] as ScatterplotOutput['data'][0]; // Assuming data is an array with a single ScatPlotDataProps object

  if (!scatterplotData) {
    console.error('Scatterplot data is unavailable or invalid.');
    return null;
  }
  const {variableX, variableY} = output.result as ScatterplotOutput['result'];

  const scatterPlotProps: ScatterPlotProps = {
    id: Math.random().toString(36).substring(7),
    type: 'scatter',
    variableX: variableX,
    variableY: variableY,
    data: [scatterplotData]
  };

  // handle click event
  const onClick = () => {
    // dispatch action to update redux state with the new scatterplot
    dispatch(addPlot({...scatterPlotProps, isNew: true}));
    // hide the button once clicked
    setHide(true);
  };

  return (
    <div className="w-full">
      {<Scatterplot data={scatterPlotProps} />}
      {!hide && (
        <Button
          radius="full"
          className="mt-2 w-full bg-gradient-to-tr from-blue-500 to-green-500 text-white shadow-none"
          onClick={onClick}
          startContent={<HeartIcon />}
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
      )}
    </div>
  );
};
