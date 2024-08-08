import {useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';

import {addPlot} from '@/actions/plot-actions';
import {ScatterCallbackOutput} from '@/ai/assistant/callbacks/callback-scatter';
import {Scatterplot} from '../plots/scatter-plot';
import {CustomCreateButton} from '../common/custom-create-button';
import {GeoDaState} from '@/store';
import {ScatterPlotStateProps} from '@/reducers/plot-reducer';
import {CustomFunctionOutputProps} from '@/ai/types';

export function isCustomScatterPlotOutput(
  props: CustomFunctionOutputProps<unknown, unknown>
): props is ScatterCallbackOutput {
  return props.type === 'scatter';
}

/**
 * Custom Scatter Plot Message
 */
export const CustomScatterPlotMessage = ({
  functionOutput
}: {
  functionOutput: ScatterCallbackOutput;
  functionArgs: Record<string, any>;
}) => {
  const dispatch = useDispatch();

  const {id, datasetId, variableX, variableY} = functionOutput.result;

  const scatterPlotProps: ScatterPlotStateProps = {
    id,
    datasetId,
    type: 'scatter',
    variableX: variableX,
    variableY: variableY
  };

  // get plot from redux store
  const plot = useSelector((state: GeoDaState) => state.root.plots.find(p => p.id === id));
  const [hide, setHide] = useState(Boolean(plot) || false);

  // handle click event
  const onClick = () => {
    // dispatch action to update redux state with the new scatterplot
    dispatch(addPlot({...scatterPlotProps, isNew: true}));
    // hide the button once clicked
    setHide(true);
  };

  return (
    <div className="w-full">
      {!hide && (
        <div className="h-[280px] w-full">
          <Scatterplot props={scatterPlotProps} />
        </div>
      )}
      <CustomCreateButton onClick={onClick} hide={hide} label="Click to Add This Scatterplot" />
    </div>
  );
};
