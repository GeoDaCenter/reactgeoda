import {useState} from 'react';

import {addWeights} from '@/actions';
import {useDispatch} from 'react-redux';
import {CustomCreateButton} from '../common/custom-create-button';
import {WeightsCallbackOutput} from '@/ai/assistant/callbacks/callback-weights';
import {CustomFunctionOutputProps} from '@/ai/openai-utils';

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

  const [hide, setHide] = useState(false);

  const {datasetId, weightsMeta} = functionOutput.result;

  const weights = functionOutput.data;

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
