import {HistogramDataProps} from '@/utils/histogram-utils';
import {ScatPlotDataProps} from '@/utils/scatterplot-utils';

export enum PLOT_ACTIONS {
  ADD_PLOT = 'ADD_PLOT',
  REMOVE_PLOT = 'REMOVE_PLOT'
}

type BasePlotProps = {
  id: string;
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
  data: ScatPlotDataProps[];
  // isNew is used to determine if the plots are newly added by chatbot, so a number badge can be shown on the plot icon
  isNew?: boolean;
};

export type PlotProps = HistogramPlotProps | ScatterPlotProps;

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
