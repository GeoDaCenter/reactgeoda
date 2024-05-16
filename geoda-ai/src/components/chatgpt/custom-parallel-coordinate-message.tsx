import {useState} from 'react';
import {useDispatch} from 'react-redux';

import {ParallelCoordinateProps, addPlot} from '@/actions/plot-actions';
import {ParallelCoordinateOutput} from '@/ai/assistant/custom-functions';
import {ParallelCoordinatePlot} from '../plots/parallel-coordinate-plot';
import {CustomCreateButton} from '../common/custom-create-button';
import {CustomMessagePayload} from './custom-messages';

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
    // dispatch action to update redux state
    dispatch(addPlot({id, type: 'parallel-coordinate', variables, isNew: true}));
    // hide the button once clicked
    setHide(true);
  };

  return (
    <div className="h-[330px] w-full">
      <div className="h-[280px] w-full">
        <ParallelCoordinatePlot props={parallelCoordinateProps} />
      </div>
      <CustomCreateButton onClick={onClick} hide={hide} label="Click to Add This PCP Plot" />
    </div>
  );
};
