import {Button} from '@nextui-org/react';
import Typewriter from 'typewriter-effect';
import {useState} from 'react';

import {ParallelCoordinateProps, addPlot} from '@/actions/plot-actions';
import {CustomMessagePayload} from './custom-messages';
import {HeartIcon} from '../icons/heart';
import {ParallelCoordinateOutput} from '@/utils/custom-functions';
import {ParallelCoordinatePlot} from '../plots/parallel-coordinate-plot';
import {useDispatch} from 'react-redux';

/**
 * Custom PCP plot Message
 */
export const CustomParallelCoordinateMessage = ({props}: {props: CustomMessagePayload}) => {
  const dispatch = useDispatch();
  const [hide, setHide] = useState(false);
  const {output} = props;

  const {id, variables} = output.result as ParallelCoordinateOutput['result'];

  const parallelCoordinateProps: ParallelCoordinateProps = {
    id,
    type: 'parallel-coordinate',
    variables
  };

  // handle click event
  const onClick = () => {
    // dispatch action to update redux state state.root.weights
    dispatch(addPlot({id, type: 'parallel-coordinate', variables, isNew: true}));
    // hide the button once clicked
    setHide(true);
  };

  return (
    <div className="w-full">
      {<ParallelCoordinatePlot props={parallelCoordinateProps} />}
      {!hide && (
        <Button
          radius="full"
          className="mt-2 w-full bg-gradient-to-tr from-pink-500 to-yellow-500 text-white shadow-none"
          onClick={onClick}
          startContent={<HeartIcon />}
        >
          <Typewriter
            options={{
              strings: `Click to Add This PCP Plot`,
              autoStart: true,
              loop: false,
              delay: 10
            }}
          />
        </Button>
      )}
    </div>
  );
};
