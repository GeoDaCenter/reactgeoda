import {ReactNode, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';

import {addPlot} from '@/actions/plot-actions';
import {
  BubbleChartCallbackOutput,
  BubbleChartCallbackResult,
  isBubbleChartCallbackResult,
  isCustomBubbleChartOutput
} from '@/ai/assistant/callbacks/callback-bubble';
import {BubbleChart} from '../plots/bubble-chart-plot';
import {CustomCreateButton} from '../common/custom-create-button';
import {GeoDaState} from '@/store';
import {BubbleChartStateProps} from '@/reducers/plot-reducer';
import {CustomFunctionCall} from '@/ai/types';

export function customBubbleChartMessageCallback({
  functionArgs,
  output
}: CustomFunctionCall): ReactNode | null {
  if (isCustomBubbleChartOutput(output)) {
    return <CustomBubbleChartMessage functionOutput={output} functionArgs={functionArgs} />;
  }
  return null;
}

/**
 * Custom Bubble Chart Message
 */
export const CustomBubbleChartMessage = ({
  functionOutput
}: {
  functionOutput: BubbleChartCallbackOutput;
  functionArgs: Record<string, any>;
}) => {
  const dispatch = useDispatch();

  const {id, datasetId, variableX, variableY, variableSize, variableColor} =
    functionOutput.result as BubbleChartCallbackResult;

  // get plot from redux store
  const plot = useSelector((state: GeoDaState) => state.root.plots.find(p => p.id === id));
  const [hide, setHide] = useState(Boolean(plot) || false);

  if (!isBubbleChartCallbackResult(functionOutput.result)) {
    return null;
  }

  const bubbleChartProps: BubbleChartStateProps = {
    id,
    datasetId,
    type: 'bubble',
    variableX: variableX,
    variableY: variableY,
    variableSize: variableSize,
    variableColor: variableColor
  };

  // Handle click event
  const onClick = () => {
    // Dispatch action to update redux state with the new bubble chart
    dispatch(addPlot({...bubbleChartProps, isNew: true}));
    // Hide the button once clicked
    setHide(true);
  };

  return (
    <div className="mt-4 w-full">
      {!hide && (
        <div className="h-[280px] w-full">
          <BubbleChart props={bubbleChartProps} />
        </div>
      )}
      <CustomCreateButton onClick={onClick} hide={hide} label="Click to Add This Bubble Chart" />
    </div>
  );
};
