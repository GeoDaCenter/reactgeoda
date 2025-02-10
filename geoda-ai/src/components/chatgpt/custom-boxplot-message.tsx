import {Button} from '@nextui-org/react';
import {ReactNode, useState} from 'react';

import {addPlot} from '@/actions/plot-actions';
import {HeartIcon} from '../icons/heart';
import {
  BoxPlotCallbackOutput,
  BoxPlotCallbackResult,
  isBoxPlotCallbackResult,
  isCustomBoxPlotOutput
} from '@/ai/assistant/callbacks/callback-box';
import {BoxPlot} from '../plots/box-plot';
import {useDispatch, useSelector} from 'react-redux';
import {GreenCheckIcon} from '../icons/green-check';
import {GeoDaState} from '@/store';
import {BoxPlotStateProps} from '@/reducers/plot-reducer';
import {CustomFunctionCall} from '@openassistant/core';

export function customBoxPlotMessageCallback({
  functionArgs,
  output
}: CustomFunctionCall): ReactNode | null {
  if (isCustomBoxPlotOutput(output)) {
    return <CustomBoxplotMessage functionOutput={output} functionArgs={functionArgs} />;
  }
  return null;
}

/**
 * Custom BoxPlot Message
 */
export const CustomBoxplotMessage = ({
  functionOutput
}: {
  functionOutput: BoxPlotCallbackOutput;
  functionArgs: Record<string, any>;
}) => {
  const dispatch = useDispatch();

  const {id, datasetId, variables, boundIQR} = functionOutput.result as BoxPlotCallbackResult;
  const boxplot = functionOutput.data;

  const plot = useSelector((state: GeoDaState) => state.root.plots.find(p => p.id === id));
  const [hide, setHide] = useState(Boolean(plot) || false);

  if (!isBoxPlotCallbackResult(functionOutput.result)) {
    return null;
  }

  // handle click event
  const onClick = () => {
    // dispatch action to update redux state state.root.weights
    dispatch(addPlot({...boxPlotProps, isNew: true}));
    // hide the button once clicked
    setHide(true);
  };

  if (!boxplot) {
    return null;
  }

  const boxPlotProps: BoxPlotStateProps = {
    id,
    datasetId,
    type: 'boxplot',
    variables,
    boundIQR,
    data: boxplot
  };

  return (
    <div className="mt-4 w-full">
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
        Click to Add This Box Plot
      </Button>
    </div>
  );
};
