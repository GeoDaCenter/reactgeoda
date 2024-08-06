import {useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';

import {addPlot} from '@/actions/plot-actions';
import {HistogramCallbackOutput} from '@/ai/assistant/callbacks/callback-histogram';
import {HistogramPlot} from '../plots/histogram-plot';
import {CustomCreateButton} from '../common/custom-create-button';
import {GeoDaState} from '@/store';
import {HistogramPlotStateProps} from '@/reducers/plot-reducer';
import {CustomFunctionOutputProps} from '@/ai/openai-utils';

export function isCustomHistogramOutput(
  props: CustomFunctionOutputProps<unknown, unknown>
): props is HistogramCallbackOutput {
  return props.type === 'histogram';
}

/**
 * Custom Histogram Message
 */
export const CustomHistogramMessage = ({
  functionOutput
}: {
  functionOutput: HistogramCallbackOutput;
  functionArgs: Record<string, any>;
}) => {
  const dispatch = useDispatch();

  const {id, datasetId, numberOfBins, variableName} = functionOutput.result;
  const histogram = functionOutput.data;

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
