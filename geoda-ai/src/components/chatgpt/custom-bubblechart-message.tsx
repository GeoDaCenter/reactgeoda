import {useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';

import {addPlot} from '@/actions/plot-actions';
import {CustomMessagePayload} from './custom-messages';
import {BubbleChartOutput} from '@/ai/assistant/callbacks/callback-bubble';
import {BubbleChart} from '../plots/bubble-chart-plot';
import {CustomCreateButton} from '../common/custom-create-button';
import {GeoDaState} from '@/store';
import {BubbleChartStateProps} from '@/reducers/plot-reducer';

/**
 * Custom Bubble Chart Message
 */
export const CustomBubbleChartMessage = ({props}: {props: CustomMessagePayload}) => {
  const dispatch = useDispatch();

  const {output} = props;

  const {id, datasetId, variableX, variableY, variableSize, variableColor} =
    output.result as BubbleChartOutput['result'];

  const bubbleChartProps: BubbleChartStateProps = {
    id,
    datasetId,
    type: 'bubble',
    variableX: variableX,
    variableY: variableY,
    variableSize: variableSize,
    variableColor: variableColor
  };

  // get plot from redux store
  const plot = useSelector((state: GeoDaState) => state.root.plots.find(p => p.id === id));
  const [hide, setHide] = useState(Boolean(plot) || false);

  // Handle click event
  const onClick = () => {
    // Dispatch action to update redux state with the new bubble chart
    dispatch(addPlot({...bubbleChartProps, isNew: true}));
    // Hide the button once clicked
    setHide(true);
  };

  return (
    <div className="w-full">
      {!hide && (
        <div className="h-[280px] w-full">
          <BubbleChart props={bubbleChartProps} />
        </div>
      )}
      <CustomCreateButton onClick={onClick} hide={hide} label="Click to Add This Bubble Chart" />
    </div>
  );
};
