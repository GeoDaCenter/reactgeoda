import {useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';

import {ParallelCoordinateProps, addPlot} from '@/actions/plot-actions';
import {ParallelCoordinateOutput} from '@/ai/assistant/custom-functions';
import {ParallelCoordinatePlot} from '../plots/parallel-coordinate-plot';
import {CustomCreateButton} from '../common/custom-create-button';
import {CustomMessagePayload} from './custom-messages';
import {GeoDaState} from '@/store';

/**
 * Custom PCP plot Message
 */
export const CustomParallelCoordinateMessage = ({props}: {props: CustomMessagePayload}) => {
  const dispatch = useDispatch();
  const {output} = props;

  const {id, variables} = output.result as ParallelCoordinateOutput['result'];

  const parallelCoordinateProps: ParallelCoordinateProps = {
    id,
    type: 'parallel-coordinate',
    variables
  };

  // get plot from redux store
  const plot = useSelector((state: GeoDaState) => state.root.plots.find(p => p.id === id));
  const [hide, setHide] = useState(Boolean(plot) || false);

  // handle click event
  const onClick = () => {
    // dispatch action to update redux state
    dispatch(addPlot({id, type: 'parallel-coordinate', variables, isNew: true}));
    // hide the button once clicked
    setHide(true);
  };

  return (
    <div className="w-full">
      {!hide && (
        <div className="h-[280px] w-full">
          <ParallelCoordinatePlot props={parallelCoordinateProps} />
        </div>
      )}
      <CustomCreateButton onClick={onClick} hide={hide} label="Click to Add This PCP Plot" />
    </div>
  );
};
