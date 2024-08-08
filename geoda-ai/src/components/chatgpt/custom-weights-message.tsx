import {useEffect, useState} from 'react';

import {addWeights} from '@/actions';
import {useDispatch} from 'react-redux';
import {CustomCreateButton} from '../common/custom-create-button';
import {WeightsCallbackOutput} from '@/ai/assistant/callbacks/callback-weights';
import {CustomFunctionOutputProps} from '@/ai/types';

/**
 * Type guard for Custom Weights Output
 * @param props The custom function output props
 * @returns The flag indicates the function output is a custom weights output
 */
export function isCustomWeightsOutput(
  props: CustomFunctionOutputProps<unknown, unknown>
): props is WeightsCallbackOutput {
  return props.type === 'weights';
}

/**
 * Custom Weights Message
 */
export const CustomWeightsMessage = ({
  functionOutput
}: {
  functionOutput: WeightsCallbackOutput;
  functionArgs: Record<string, any>;
}) => {
  const dispatch = useDispatch();

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const {datasetId, success, ...weightsMeta} = functionOutput.result;

  const weights = functionOutput.data;

  const [hide, setHide] = useState(functionOutput.isIntermediate || false);

  // dispatch action to add weights when isInermediate is true when mounting the component
  useEffect(() => {
    if (functionOutput.isIntermediate) {
      if (weights) {
        dispatch(addWeights({datasetId, weights, weightsMeta, isNew: true}));
        setHide(true);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // handle click event
  const onClick = () => {
    if (weights) {
      // dispatch action to update redux state state.root.weights
      dispatch(addWeights({datasetId, weights, weightsMeta, isNew: true}));
      // hide the button once clicked
      setHide(true);
    }
  };

  return (
    <div className="w-full">
      {/* <WeightsMetaTable weightsMeta={output.data as WeightsMeta} /> */}
      <CustomCreateButton onClick={onClick} hide={hide} label="Click to Add This Spatial Weights" />
    </div>
  );
};
