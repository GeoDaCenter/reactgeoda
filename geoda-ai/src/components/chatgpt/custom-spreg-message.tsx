import {useState} from 'react';
import {useDispatch} from 'react-redux';

import {addRegression} from '@/actions/regression-actions';
import {generateRandomId} from '@/utils/ui-utils';
import {CustomCreateButton} from '../common/custom-create-button';
import {RegressionCallbackOutput} from '@/ai/assistant/callbacks/callback-regression';
import {CustomFunctionOutputProps} from '@/ai/types';

export function isCustomRegressionOutput(
  functionOutput: CustomFunctionOutputProps<unknown, unknown>
): functionOutput is RegressionCallbackOutput {
  return functionOutput.type === 'regression';
}

/**
 * Custom Spreg Message
 */
export const CustomSpregMessage = ({
  functionOutput
}: {
  functionOutput: RegressionCallbackOutput;
  functionArgs: Record<string, any>;
}) => {
  const [hide, setHide] = useState(false);
  const dispatch = useDispatch();

  const regResult = functionOutput.data;

  // handle click event
  const onClick = () => {
    // dispatch action to create regression and add to store
    if (regResult) {
      // generate random id
      const id = generateRandomId();
      dispatch(addRegression({id, type: 'regression', data: regResult, isNew: true}));
      // hide the button once clicked
      setHide(true);
    }
  };

  return (
    <div className="w-full">
      <CustomCreateButton
        onClick={onClick}
        hide={hide}
        label="Click to Add This Regression Result"
      />
    </div>
  );
};
