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
import {PlotActionProps} from '@/actions';
import {generateRandomId} from '@/utils/ui-utils';
import KeplerTable from '@kepler.gl/table';
import {MAP_ID} from '@/constants';
import {getColumnDataFromKeplerDataset} from '@/utils/data-utils';
import {createHistogram} from '@/utils/plots/histogram-utils';
import {createBoxplot, CreateBoxplotProps} from '@/utils/plots/boxplot-utils';

export function addPlotUpdater(
  state: PlotStateProps[],
  action: PlotAction,
  keplerState: GeoDaState['keplerGl']
) {
  const payload = action.payload as PlotActionProps;
  // generate random id for plot
  const id = generateRandomId();
  const keplerDataset: KeplerTable = keplerState[MAP_ID].visState.datasets[payload.datasetId];

  if (payload.type === 'histogram') {
    // get kepler dataset
    const {variable, intervals} = payload;
    // get data from variable
    const data = getColumnDataFromKeplerDataset(variable, keplerDataset);
    const histogram = createHistogram(data, intervals || 7);
    // create histogram plot state
    const plotState: HistogramPlotStateProps = {...payload, id, data: histogram};

    return [...state, plotState];
  } else if (payload.type === 'scatter') {
    // const {variableX, variableY} = payload;
    // get data from variableX and variableY
    // const dataX = getColumnDataFromKeplerDataset(variableX, keplerDataset);
    // const dataY = getColumnDataFromKeplerDataset(variableY, keplerDataset);
    // compute regression statistics for dataX and dataY

    // create scatter plot state
    const plotState: ScatterPlotStateProps = {...payload, id};
    return [...state, plotState];
  } else if (payload.type === 'boxplot') {
    const {variables, boundIQR} = payload;
    const data = variables.reduce((prev: CreateBoxplotProps['data'], columnName: string) => {
      const values = getColumnDataFromKeplerDataset(columnName, keplerDataset);
      prev[columnName] = values;
      return prev;
    }, {});
    const boxplot = createBoxplot({data, boundIQR});
    // create boxplot plot state
    const plotState: BoxPlotStateProps = {...payload, id, data: boxplot};

    return [...state, plotState];
  } else if (payload.type === 'bubble') {
    const plotState: BubbleChartStateProps = {...payload, id};
    return [...state, plotState];
  } else if (payload.type === 'parallel-coordinate') {
    // TODO: add stats for each variable
    const plotState: ParallelCoordinateStateProps = {...payload, id};
    return [...state, plotState];
  }

  console.log('Plot type not supported');
  return state;
}
