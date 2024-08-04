import {useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';

import {addPlot} from '@/actions/plot-actions';
import {CustomMessagePayload} from './custom-messages';
import {HistogramOutput} from '@/ai/assistant/callbacks/callback-histogram';
import {HistogramPlot} from '../plots/histogram-plot';
import {CustomCreateButton} from '../common/custom-create-button';
import {GeoDaState} from '@/store';
import {HistogramPlotStateProps} from '@/reducers/plot-reducer';

/**
 * Custom Histogram Message
 */
export const CustomHistogramMessage = ({props}: {props: CustomMessagePayload}) => {
  const dispatch = useDispatch();
  const {output} = props;

  const {id, datasetId, numberOfBins, variableName} = output.result as HistogramOutput['result'];
  const histogram = 'data' in output ? (output.data as HistogramOutput['data']) : null;

  const histogramPlotProps: HistogramPlotStateProps = {
    id,
    datasetId,
    type: 'histogram',
    variable: variableName,
    numberOfBins,
    data: histogram || []
  };

  // get plot from redux store
  const plot = useSelector((state: GeoDaState) => state.root.plots.find(p => p.id === id));
  const [hide, setHide] = useState(Boolean(plot) || false);

  // handle click event
  const onClick = () => {
    if (histogram) {
      // dispatch action to add plot
      dispatch(addPlot({...histogramPlotProps, isNew: true}));
      // hide the button once clicked
      setHide(true);
    }
  };

  return (
    <div className="w-full">
      {!hide && (
        <div className="h-[280px] w-full ">
          <HistogramPlot props={histogramPlotProps} />
        </div>
      )}
      <CustomCreateButton onClick={onClick} hide={hide} label="Click to Add This Histogram" />
    </div>
  );
};
