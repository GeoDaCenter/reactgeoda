import {GeoDaState} from '@/store';
import {
  HistogramPlotStateProps,
  PlotAction,
  PlotStateProps,
  ScatterPlotStateProps,
  BoxPlotStateProps,
  BubbleChartStateProps,
  ParallelCoordinateStateProps
} from './plot-reducer';
import {
  BoxPlotActionProps,
  BubbleChartActionProps,
  HistogramPlotActionProps,
  ParallelCoordinateActionProps,
  PlotActionProps,
  ScatterPlotActionProps
} from '@/actions';
import {generateRandomId} from '@/utils/ui-utils';
import KeplerTable from '@kepler.gl/table';
import {MAP_ID} from '@/constants';
import {getColumnDataFromKeplerDataset} from '@/utils/data-utils';
import {createHistogram} from '@/utils/plots/histogram-utils';
import {createBoxplot, CreateBoxplotProps} from '@/utils/plots/boxplot-utils';

function addHistogramPlotUpdater(
  payload: HistogramPlotActionProps,
  keplerDataset: KeplerTable,
  state: PlotStateProps[]
) {
  // get kepler dataset
  const {id, variable, numberOfBins: intervals, data} = payload;
  let histogram = data;
  if (!histogram) {
    // compute histogram data if needed
    const values = getColumnDataFromKeplerDataset(variable, keplerDataset);
    histogram = createHistogram(values, intervals || 7);
  }
  // create histogram plot state
  const plotState: HistogramPlotStateProps = {
    ...payload,
    id: id || generateRandomId(),
    data: histogram
  };

  return [...state, plotState];
}

function addScatterPlotUpdater(
  payload: ScatterPlotActionProps,
  _keplerDataset: KeplerTable,
  state: PlotStateProps[]
) {
  const {id} = payload;
  // get data from variableX and variableY
  // const dataX = getColumnDataFromKeplerDataset(variableX, keplerDataset);
  // const dataY = getColumnDataFromKeplerDataset(variableY, keplerDataset);
  // compute regression statistics for dataX and dataY

  // create scatter plot state
  const plotState: ScatterPlotStateProps = {...payload, id: id || generateRandomId()};
  return [...state, plotState];
}

function addBoxPlotUpdater(
  payload: BoxPlotActionProps,
  keplerDataset: KeplerTable,
  state: PlotStateProps[]
) {
  const {id, variables, boundIQR, data} = payload;
  let boxplot = data;
  if (!boxplot) {
    const values = variables.reduce((prev: CreateBoxplotProps['data'], columnName: string) => {
      const values = getColumnDataFromKeplerDataset(columnName, keplerDataset);
      prev[columnName] = values;
      return prev;
    }, {});
    boxplot = createBoxplot({data: values, boundIQR});
  }
  // create boxplot plot state
  const plotState: BoxPlotStateProps = {...payload, id: id || generateRandomId(), data: boxplot};

  return [...state, plotState];
}

function addParallelCoordinatePlotUpdater(
  payload: ParallelCoordinateActionProps,
  _keplerDataset: KeplerTable,
  state: PlotStateProps[]
) {
  // get kepler dataset
  const {id} = payload;

  // get data from variables
  // const data = variables.map((variable: string) => {
  //   return getColumnDataFromKeplerDataset(variable, keplerDataset);
  // });

  // create parallel coordinate plot state
  const plotState: ParallelCoordinateStateProps = {...payload, id: id || generateRandomId()};
  return [...state, plotState];
}

function addBubbleChartUpdater(
  payload: BubbleChartActionProps,
  _keplerDataset: KeplerTable,
  state: PlotStateProps[]
) {
  const {id} = payload;
  // get data from variables
  // const dataX = getColumnDataFromKeplerDataset(variableX, keplerDataset);
  // const dataY = getColumnDataFromKeplerDataset(variableY, keplerDataset);
  // const dataZ = getColumnDataFromKeplerDataset(variableZ, keplerDataset);
  // create bubble chart plot state
  const plotState: BubbleChartStateProps = {...payload, id: id || generateRandomId()};
  return [...state, plotState];
}

export function addPlotUpdater(
  state: PlotStateProps[],
  action: PlotAction,
  keplerState: GeoDaState['keplerGl']
) {
  const payload = action.payload as PlotActionProps;
  const keplerDataset: KeplerTable = keplerState[MAP_ID].visState.datasets[payload.datasetId];

  if (payload.type === 'histogram') {
    return addHistogramPlotUpdater(payload, keplerDataset, state);
  } else if (payload.type === 'scatter') {
    return addScatterPlotUpdater(payload, keplerDataset, state);
  } else if (payload.type === 'boxplot') {
    return addBoxPlotUpdater(payload, keplerDataset, state);
  } else if (payload.type === 'bubble') {
    return addBubbleChartUpdater(payload, keplerDataset, state);
  } else if (payload.type === 'parallel-coordinate') {
    return addParallelCoordinatePlotUpdater(payload, keplerDataset, state);
  }

  console.error('Plot type not supported');
  return state;
}
