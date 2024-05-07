import {HistogramDataProps} from '@/utils/plots/histogram-utils';
import {BoxplotDataProps} from '@/utils/plots/boxplot-utils';
import {BubbleChartDataProps} from '@/utils/bubblechart-utils';

export enum PLOT_ACTIONS {
  ADD_PLOT = 'ADD_PLOT',
  REMOVE_PLOT = 'REMOVE_PLOT'
}

type BasePlotProps = {
  id: string;
  type: string;
  // isNew is used to determine if the plots are newly added by chatbot, so a number badge can be shown on the plot icon
  isNew?: boolean;
};

export type HistogramPlotProps = BasePlotProps & {
  type: 'histogram';
  variable: string;
  data: HistogramDataProps[];
};

export type ScatterPlotProps = BasePlotProps & {
  type: 'scatter';
  variableX: string;
  variableY: string;
};

export type BoxPlotProps = BasePlotProps & {
  type: 'boxplot';
  variables: string[];
  data: BoxplotDataProps;
};

export type ParallelCoordinateProps = BasePlotProps & {
  type: 'parallel-coordinate';
  variables: string[];
};

export type BubbleChartProps = BasePlotProps & {
  type: 'bubble';
  variableX: string;
  variableY: string;
  variableSize: string;
  variableColor?: string; // optionally, color
  data: BubbleChartDataProps;
};

export type PlotProps =
  | HistogramPlotProps
  | ScatterPlotProps
  | BoxPlotProps
  | BubbleChartProps
  | ParallelCoordinateProps;

export type RemovePlotProps = {
  id: string;
};

export const addPlot = (newPlot: PlotProps) => ({
  type: PLOT_ACTIONS.ADD_PLOT,
  payload: newPlot
});

export const removePlot = (id: string) => ({
  type: PLOT_ACTIONS.REMOVE_PLOT,
  payload: {id}
});
