import {ReactNode, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';

import {addPlot} from '@/actions/plot-actions';
import {
  ParallelCoordinateCallbackOutput,
  ParallelCoordinateCallbackResult
} from '@/ai/assistant/callbacks/callback-pcp';
import {ParallelCoordinatePlot} from '../plots/parallel-coordinate-plot';
import {CustomCreateButton} from '../common/custom-create-button';
import {GeoDaState} from '@/store';
import {ParallelCoordinateStateProps} from '@/reducers/plot-reducer';
import {
  CustomFunctionCall,
  CustomFunctionOutputProps,
  ErrorCallbackResult
} from '@openassistant/core';

export function customPCPMessageCallback({
  functionArgs,
  output
}: CustomFunctionCall): ReactNode | null {
  if (isCustomParallelCoordinateOutput(output)) {
    return <CustomParallelCoordinateMessage functionOutput={output} functionArgs={functionArgs} />;
  }
  return null;
}

export function isCustomParallelCoordinateOutput(
  props: CustomFunctionOutputProps<unknown, unknown>
): props is ParallelCoordinateCallbackOutput {
  return props.type === 'parallel-coordinate';
}

function isPCPCallbackResult(
  props: ParallelCoordinateCallbackResult | ErrorCallbackResult
): props is ParallelCoordinateCallbackResult {
  return (props as ParallelCoordinateCallbackResult).variables !== undefined;
}

/**
 * Custom PCP plot Message
 */
export const CustomParallelCoordinateMessage = ({
  functionOutput
}: {
  functionOutput: ParallelCoordinateCallbackOutput;
  functionArgs: Record<string, any>;
}) => {
  const dispatch = useDispatch();

  const {id, datasetId, variables} =
    (functionOutput.result as ParallelCoordinateCallbackResult) || {};

  // get plot from redux store
  const plot = useSelector((state: GeoDaState) => state.root.plots.find(p => p.id === id));
  const [hide, setHide] = useState(Boolean(plot) || false);

  if (!isPCPCallbackResult(functionOutput.result)) {
    return null;
  }

  const parallelCoordinateProps: ParallelCoordinateStateProps = {
    id,
    datasetId,
    type: 'parallel-coordinate',
    variables
  };

  // handle click event
  const onClick = () => {
    // dispatch action to update redux state
    dispatch(addPlot({...parallelCoordinateProps, isNew: true}));
    // hide the button once clicked
    setHide(true);
  };

  return (
    <div className="mt-4 w-full">
      {!hide && (
        <div className="h-[280px] w-full">
          <ParallelCoordinatePlot props={parallelCoordinateProps} />
        </div>
      )}
      <CustomCreateButton onClick={onClick} hide={hide} label="Click to Add This PCP Plot" />
    </div>
  );
};
