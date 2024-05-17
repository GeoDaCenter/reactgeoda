import {useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';

import {generateRandomId} from '@/utils/ui-utils';
import {ScatterPlotProps, addPlot} from '@/actions/plot-actions';
import {ScatterplotOutput} from '@/ai/assistant/custom-functions';
import {Scatterplot} from '../plots/scatter-plot';
import {CustomMessagePayload} from './custom-messages';
import {CustomCreateButton} from '../common/custom-create-button';
import { GeoDaState } from '@/store';

/**
 * Custom Scatter Message
 */
export const CustomScatterplotMessage = ({props}: {props: CustomMessagePayload}) => {
  const dispatch = useDispatch();
  const {output} = props;

  if (!output || !output.result || typeof output.result !== 'object') {
    console.error('Scatterplot data is unavailable or invalid.');
    return null;
  }

  const scatterplotData = output.result;

  if (!scatterplotData) {
    console.error('Scatterplot data is unavailable or invalid.');
    return null;
  }
  const {id, variableX, variableY} = output.result as ScatterplotOutput['result'];

  const scatterPlotProps: ScatterPlotProps = {
    id,
    type: 'scatter',
    variableX: variableX,
    variableY: variableY
  };

  // get plot from redux store
  const plot = useSelector((state: GeoDaState) => state.root.plots.find(p => p.id === id));
  const [hide, setHide] = useState(Boolean(plot) || false);

  // handle click event
  const onClick = () => {
    // dispatch action to update redux state with the new scatterplot
    dispatch(addPlot({...scatterPlotProps, isNew: true}));
    // hide the button once clicked
    setHide(true);
  };

  return (
    <div className="w-full">
      {!hide && (
        <div className="h-[280px] w-full">
          <Scatterplot props={scatterPlotProps} />
        </div>
      )}
      <CustomCreateButton onClick={onClick} hide={hide} label="Click to Add This Scatterplot" />
    </div>
  );
};
