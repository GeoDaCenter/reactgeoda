import {useState} from 'react';
import {useDispatch} from 'react-redux';

import {HistogramPlotProps, addPlot} from '@/actions/plot-actions';
import {CustomMessagePayload} from './custom-messages';
import {HistogramOutput} from '@/ai/assistant/custom-functions';
import {HistogramPlot} from '../plots/histogram-plot';
import {CustomCreateButton} from '../common/custom-create-button';

/**
 * Custom Histogram Message
 */
export const CustomHistogramMessage = ({props}: {props: CustomMessagePayload}) => {
  const dispatch = useDispatch();
  const [hide, setHide] = useState(false);
  const {output} = props;

  const {id, variableName} = output.result as HistogramOutput['result'];
  const histogram = 'data' in output && (output.data as HistogramOutput['data']);

  const histogramPlotProps: HistogramPlotProps = {
    id,
    type: 'histogram',
    variable: variableName,
    data: histogram || []
  };

  // handle click event
  const onClick = () => {
    if (histogram) {
      // dispatch action to update redux state state.root.weights
      dispatch(
        addPlot({id, type: 'histogram', variable: variableName, data: histogram, isNew: true})
      );
      // hide the button once clicked
      setHide(true);
    }
  };

  return (
    <div className="h-[330px] w-full">
      <div className="h-[280px] w-full">
        <HistogramPlot props={histogramPlotProps} />
      </div>
      <CustomCreateButton onClick={onClick} hide={hide} label="Click to Add This Histogram" />
    </div>
  );
};
