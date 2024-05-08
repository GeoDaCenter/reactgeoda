import {Button} from '@nextui-org/react';
import Typewriter from 'typewriter-effect';
import {useState} from 'react';

import {CustomMessagePayload} from './custom-messages';
import {HeartIcon} from '../icons/heart';
import {useDispatch} from 'react-redux';
import {GreenCheckIcon} from '../icons/green-check';
import {addRegression, RegressionDataProps} from '@/actions/regression-actions';
import {generateRandomId} from '@/utils/ui-utils';

/**
 * Custom Spreg Message
 */
export const CustomSpregMessage = ({props}: {props: CustomMessagePayload}) => {
  const [hide, setHide] = useState(false);
  const {output} = props;
  const dispatch = useDispatch();

  const regResult = output.data as RegressionDataProps;

  // handle click event
  const onClick = () => {
    // dispatch action to create regression and add to store
    // generate random id
    const id = generateRandomId();
    dispatch(addRegression({id, type: 'regression', data: regResult, isNew: true}));
    // hide the button once clicked
    setHide(true);
  };

  return (
    <div className="w-60">
      <Button
        radius="full"
        className="mt-2 bg-gradient-to-tr from-pink-500 to-yellow-500 text-white shadow-none"
        onClick={onClick}
        startContent={hide ? <GreenCheckIcon /> : <HeartIcon />}
        isDisabled={hide}
      >
        <Typewriter
          options={{
            strings: `Click to Add This Regression Result`,
            autoStart: true,
            loop: false,
            delay: 10
          }}
        />
      </Button>
    </div>
  );
};
