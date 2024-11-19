import {ReactNode, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';

import {addPlot} from '@/actions/plot-actions';
import {
  HistogramCallbackOutput,
  HistogramCallbackResult
} from '@/ai/assistant/callbacks/callback-histogram';
import {HistogramPlot} from '../plots/histogram-plot';
import {CustomCreateButton} from '../common/custom-create-button';
import {GeoDaState} from '@/store';
import {HistogramPlotStateProps} from '@/reducers/plot-reducer';
import {ErrorCallbackResult, CustomFunctionOutputProps, CustomFunctionCall} from 'react-ai-assist';

export function customHistogramMessageCallback({
  functionArgs,
  output
}: CustomFunctionCall): ReactNode | null {
  if (isCustomHistogramOutput(output)) {
    return <CustomHistogramMessage functionOutput={output} functionArgs={functionArgs} />;
  }
  return null;
}

export function isCustomHistogramOutput(
  props: CustomFunctionOutputProps<unknown, unknown>
): props is HistogramCallbackOutput {
  return props.type === 'histogram';
}

function isHistogramCallbackResult(
  props: HistogramCallbackResult | ErrorCallbackResult
): props is HistogramCallbackResult {
  return (props as HistogramCallbackResult).numberOfBins !== undefined;
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

  const {id, datasetId, numberOfBins, variableName} =
    functionOutput.result as HistogramCallbackResult;
  const histogram = functionOutput.data;

  // get plot from redux store
  const plot = useSelector((state: GeoDaState) => state.root.plots.find(p => p.id === id));
  const [hide, setHide] = useState(Boolean(plot) || false);

  if (!isHistogramCallbackResult(functionOutput.result)) {
    return null;
  }

  const histogramPlotProps: HistogramPlotStateProps = {
    id,
    datasetId,
    type: 'histogram',
    variable: variableName,
    numberOfBins,
    data: histogram || []
  };

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
    <div className="mt-4 w-full">
      {!hide && (
        <div className="h-[280px] w-full ">
          <HistogramPlot props={histogramPlotProps} />
        </div>
      )}
      <CustomCreateButton onClick={onClick} hide={hide} label="Click to Add This Histogram" />
    </div>
  );
};
