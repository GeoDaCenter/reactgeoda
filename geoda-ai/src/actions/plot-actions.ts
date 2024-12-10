import {BoxplotDataProps} from '@/utils/plots/boxplot-utils';
import {HistogramDataProps} from '@/utils/plots/histogram-utils';

export enum PLOT_ACTIONS {
  ADD_PLOT = 'ADD_PLOT',
  REMOVE_PLOT = 'REMOVE_PLOT',
  UPDATE_PLOT = 'UPDATE_PLOT'
}

type BasePlotActionProps = {
  id?: string;
  datasetId: string;
  type: string;
  // isNew is used to determine if the plots are newly added by chatbot, so a number badge can be shown on the plot icon
  isNew?: boolean;
};

export type HistogramPlotActionProps = BasePlotActionProps & {
  type: 'histogram';
  variable: string;
  numberOfBins: number;
  data?: HistogramDataProps[];
};

export type ScatterPlotActionProps = BasePlotActionProps & {
  type: 'scatter';
  variableX: string;
  variableY: string;
  showMore?: boolean;
};

export type BoxPlotActionProps = BasePlotActionProps & {
  type: 'boxplot';
  variables: string[];
  boundIQR: number;
  data?: BoxplotDataProps;
};

export type ParallelCoordinateActionProps = BasePlotActionProps & {
  type: 'parallel-coordinate';
  variables: string[];
};

export type BubbleChartActionProps = BasePlotActionProps & {
  type: 'bubble';
  variableX: string;
  variableY: string;
  variableSize: string;
  variableColor?: string; // optionally, color
};

export type MoranScatterPlotActionProps = BasePlotActionProps & {
  type: 'moranscatter';
  datasetId: string;
  variable: string;
  weightsId: string;
};

export type SimpleScatterPlotActionProps = BasePlotActionProps & {
  type: 'simplescatter';
  datasetId: string;
  variableX: string;
  variableY: string;
};

export type PlotActionProps =
  | HistogramPlotActionProps
  | ScatterPlotActionProps
  | MoranScatterPlotActionProps
  | BoxPlotActionProps
  | BubbleChartActionProps
  | ParallelCoordinateActionProps;

export type RemovePlotActionProps = {
  id: string;
};

export const addPlot = (newPlot: PlotActionProps) => ({
  type: PLOT_ACTIONS.ADD_PLOT,
  payload: newPlot
});

export const removePlot = (id: string) => ({
  type: PLOT_ACTIONS.REMOVE_PLOT,
  payload: {id}
});

export const updatePlot = (updatedPlot: PlotActionProps) => ({
  type: PLOT_ACTIONS.UPDATE_PLOT,
  payload: updatedPlot
});
