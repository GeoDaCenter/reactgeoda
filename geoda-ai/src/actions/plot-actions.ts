export enum PLOT_ACTIONS {
  ADD_PLOT = 'ADD_PLOT',
  REMOVE_PLOT = 'REMOVE_PLOT'
}

type BasePlotActionProps = {
  datasetId: string;
  type: string;
  // isNew is used to determine if the plots are newly added by chatbot, so a number badge can be shown on the plot icon
  isNew?: boolean;
};

export type HistogramPlotActionProps = BasePlotActionProps & {
  type: 'histogram';
  variable: string;
  intervals: number;
};

export type ScatterPlotActionProps = BasePlotActionProps & {
  type: 'scatter';
  variableX: string;
  variableY: string;
};

export type BoxPlotActionProps = BasePlotActionProps & {
  type: 'boxplot';
  variables: string[];
  boundIQR: number;
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

export type PlotActionProps =
  | HistogramPlotActionProps
  | ScatterPlotActionProps
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
