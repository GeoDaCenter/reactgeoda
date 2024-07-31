import {
  BoxPlotActionProps,
  BubbleChartActionProps,
  HistogramPlotActionProps,
  ParallelCoordinateActionProps,
  PLOT_ACTIONS,
  PlotActionProps,
  RemovePlotActionProps,
  ScatterPlotActionProps
} from '@/actions/plot-actions';
import {GeoDaState} from '@/store';
import {BoxplotDataProps} from '@/utils/plots/boxplot-utils';
import {HistogramDataProps} from '@/utils/plots/histogram-utils';
import {addPlotUpdater} from './plot-updaters';

const initialState: Array<PlotStateProps> = [];

export type PlotAction = {
  type: string;
  payload: PlotActionProps | RemovePlotActionProps;
};

type BasePlotStateProps = {
  id: string;
};

export type HistogramPlotStateProps = BasePlotStateProps &
  HistogramPlotActionProps & {
    data: HistogramDataProps[];
  };

export type ScatterPlotStateProps = BasePlotStateProps & ScatterPlotActionProps;

export type BoxPlotStateProps = BasePlotStateProps &
  BoxPlotActionProps & {
    data: BoxplotDataProps;
  };

export type ParallelCoordinateStateProps = BasePlotStateProps & ParallelCoordinateActionProps;

export type BubbleChartStateProps = BasePlotStateProps & BubbleChartActionProps;

export type PlotStateProps =
  | HistogramPlotStateProps
  | ScatterPlotStateProps
  | BoxPlotStateProps
  | ParallelCoordinateStateProps
  | BubbleChartStateProps;

export const plotReducer = (
  state = initialState,
  action: PlotAction,
  keplerState: GeoDaState['keplerGl']
) => {
  switch (action.type) {
    case PLOT_ACTIONS.ADD_PLOT:
      return addPlotUpdater(state, action, keplerState);
    case PLOT_ACTIONS.REMOVE_PLOT: {
      const payload = action.payload as RemovePlotActionProps;
      return state.filter(plot => plot.id !== payload.id);
    }
    default:
      return state;
  }
};
