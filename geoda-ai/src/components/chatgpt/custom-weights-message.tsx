import {WeightsMeta} from 'geoda-wasm';
import {useState} from 'react';

import {addWeights} from '@/actions';
import {CustomMessagePayload} from './custom-messages';
import {useDispatch} from 'react-redux';
import {CustomCreateButton} from '../common/custom-create-button';

/**
 * Custom Weights Message
 */
export const CustomWeightsMessage = ({props}: {props: CustomMessagePayload}) => {
  const [hide, setHide] = useState(false);
  const {output} = props;
  const dispatch = useDispatch();

  const weights = 'data' in output ? (output.data as number[][]) : [];
  const weightsMeta: WeightsMeta = output.result as WeightsMeta;

  // handle click event
  const onClick = () => {
    // dispatch action to update redux state state.root.weights
    dispatch(addWeights({weights, weightsMeta, isNew: true}));
    // hide the button once clicked
    setHide(true);
  };

  return (
    <div className="w-full">
      {/* <WeightsMetaTable weightsMeta={output.data as WeightsMeta} /> */}
      <CustomCreateButton onClick={onClick} hide={hide} label="Click to Add This Spatial Weights" />
    </div>
  );
};
