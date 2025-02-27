import {
  BoxPlotActionProps,
  BubbleChartActionProps,
  HistogramPlotActionProps,
  MoranScatterPlotActionProps,
  ParallelCoordinateActionProps,
  PLOT_ACTIONS,
  PlotActionProps,
  RemovePlotActionProps,
  ScatterPlotActionProps,
  SimpleScatterPlotActionProps
} from '@/actions/plot-actions';
import {GeoDaState} from '@/store';
import {HistogramDataProps} from '@/utils/plots/histogram-utils';
import {addPlotUpdater} from './plot-updaters';
import {DatasetProps} from './file-reducer';
import {BoxplotDataProps} from '@openassistant/echarts';

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

export type MoranScatterPlotStateProps = BasePlotStateProps & MoranScatterPlotActionProps;

export type SimpleScatterPlotStateProps = BasePlotStateProps & SimpleScatterPlotActionProps;

export type PlotStateProps =
  | HistogramPlotStateProps
  | ScatterPlotStateProps
  | BoxPlotStateProps
  | ParallelCoordinateStateProps
  | BubbleChartStateProps
  | MoranScatterPlotStateProps;

export const plotReducer = (
  state = initialState,
  action: PlotAction,
  keplerState: GeoDaState['keplerGl'],
  datasets: DatasetProps[]
) => {
  switch (action.type) {
    case PLOT_ACTIONS.ADD_PLOT:
      return addPlotUpdater(state, action, datasets, keplerState);
    case PLOT_ACTIONS.REMOVE_PLOT: {
      const payload = action.payload as RemovePlotActionProps;
      return state.filter(plot => plot.id !== payload.id);
    }
    case PLOT_ACTIONS.UPDATE_PLOT: {
      const payload = action.payload as PlotStateProps;
      return state.map(plot => {
        if (plot.id === payload.id) {
          return {...plot, ...payload};
        }
        return plot;
      });
    }
    default:
      return state;
  }
};
