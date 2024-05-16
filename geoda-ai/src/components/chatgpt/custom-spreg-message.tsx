import {useState} from 'react';
import {useDispatch} from 'react-redux';

import {addRegression, RegressionDataProps} from '@/actions/regression-actions';
import {generateRandomId} from '@/utils/ui-utils';
import {CustomMessagePayload} from './custom-messages';
import {CustomCreateButton} from '../common/custom-create-button';

/**
 * Custom Spreg Message
 */
export const CustomSpregMessage = ({props}: {props: CustomMessagePayload}) => {
  const [hide, setHide] = useState(false);
  const {output} = props;
  const dispatch = useDispatch();

  const regResult = 'data' in output && (output.data as RegressionDataProps);

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
