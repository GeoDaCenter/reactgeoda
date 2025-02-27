import {useSelector} from 'react-redux';
import {Tab, Tabs} from '@nextui-org/react';
import 'react-resizable/css/styles.css';
import {BoxplotComponentContainer} from '@openassistant/echarts';

import {HistogramPlot} from './histogram-plot';
import {BubbleChart} from './bubble-chart-plot';
import {Scatterplot} from './scatter-plot';
import {
  HistogramPlotStateProps,
  BoxPlotStateProps,
  ParallelCoordinateStateProps,
  PlotStateProps,
  ScatterPlotStateProps,
  BubbleChartStateProps,
  MoranScatterPlotStateProps
} from '@/reducers/plot-reducer';
import {GeoDaState} from '@/store';
import {ParallelCoordinatePlot} from './parallel-coordinate-plot';
import {MoranScatterPlot} from './moranscatter-plot';
import {selectRawData} from '@/store/selectors';
import {useTheme} from 'next-themes';

// type guard function to check if the plot is a histogram plot
export function isHistogramPlot(plot: PlotStateProps): plot is HistogramPlotStateProps {
  return plot.type === 'histogram';
}

// type guard function to check if the plot is a boxplot
export function isBoxPlot(plot: PlotStateProps): plot is BoxPlotStateProps {
  return plot.type === 'boxplot';
}

// type guard function to check if the plot is a boxplot
export function isParallelCoordinate(plot: PlotStateProps): plot is ParallelCoordinateStateProps {
  return plot.type === 'parallel-coordinate';
}

// type guard function to check if the plot is a scatter plot
export function isScatterPlot(plot: PlotStateProps): plot is ScatterPlotStateProps {
  return plot.type === 'scatter';
}

// type guard function to check if the plot is a bubble chart
export function isBubbleChart(plot: PlotStateProps): plot is BubbleChartStateProps {
  return plot.type === 'bubble';
}

// type guard function to check if the plot is a moran scatter plot
export function isMoranScatterPlot(plot: PlotStateProps): plot is MoranScatterPlotStateProps {
  return plot.type === 'moranscatter';
}

function BoxPlotWrapper(plot: BoxPlotStateProps) {
  const rawData = useSelector(selectRawData(plot.datasetId, plot.variables));
  const {theme} = useTheme();

  return (
    <BoxplotComponentContainer
      id={plot.id}
      datasetId={plot.datasetId}
      datasetName={plot.datasetName}
      variables={plot.variables}
      boxplotData={plot.data}
      data={rawData}
      boundIQR={plot.boundIQR}
      theme={theme}
      isExpanded={false}
      isDraggable={false}
    />
  );
}

const PlotsWrapper = ({plots, plotType}: {plots: PlotStateProps[]; plotType?: string}) => {
  const filteredPlots = plotType ? plots.filter(plot => plot.type === plotType) : plots;
  return (
    <div className="flow flow-col space-y-2">
      {filteredPlots.toReversed().map(plot => (
        <div className="mb-4 h-full w-full" key={plot.id}>
          {isHistogramPlot(plot) ? (
            <HistogramPlot key={plot.id} props={plot} />
          ) : isBoxPlot(plot) ? (
            <BoxPlotWrapper key={plot.id} {...plot} />
          ) : isParallelCoordinate(plot) ? (
            <ParallelCoordinatePlot key={plot.id} props={plot} />
          ) : isBubbleChart(plot) ? (
            <BubbleChart key={plot.id} props={plot} />
          ) : isScatterPlot(plot) ? (
            <Scatterplot key={plot.id} props={plot} />
          ) : isMoranScatterPlot(plot) ? (
            <MoranScatterPlot key={plot.id} props={plot} />
          ) : (
            <></>
          )}
        </div>
      ))}
    </div>
  );
};

// PlotWrapper component with fixed height
export function PlotWrapper(plot: PlotStateProps) {
  return (
    <div className="mb-4 h-full w-full">
      {isHistogramPlot(plot) ? (
        <HistogramPlot key={plot.id} props={plot} />
      ) : isBoxPlot(plot) ? (
        <BoxPlotWrapper key={plot.id} {...plot} />
      ) : isParallelCoordinate(plot) ? (
        <ParallelCoordinatePlot key={plot.id} props={plot} />
      ) : isBubbleChart(plot) ? (
        <BubbleChart key={plot.id} props={plot} />
      ) : isScatterPlot(plot) ? (
        <Scatterplot key={plot.id} props={plot} />
      ) : isMoranScatterPlot(plot) ? (
        <MoranScatterPlot key={plot.id} props={plot} />
      ) : null}
    </div>
  );
}

export const PlotManagementPanel = () => {
  // use selector to get plots
  const plots = useSelector((state: GeoDaState) => state.root.plots);

  return (
    <div className="flex flex-col overflow-y-scroll" style={{width: 'calc(100%)'}}>
      <Tabs aria-label="Options" color="primary" variant="solid" size="md" fullWidth={true}>
        <Tab key="all" title="All">
          <PlotsWrapper plots={plots} />
        </Tab>
        <Tab key="histogram" title="Histogram">
          <PlotsWrapper plots={plots} plotType="histogram" />
        </Tab>
        <Tab key="scatter" title="Scatter Plot">
          <PlotsWrapper plots={plots} plotType="scatter" />
        </Tab>
        <Tab key="bubble" title="Bubble Chart">
          <PlotsWrapper plots={plots} plotType="bubble" />
        </Tab>
        <Tab key="boxplot" title="Box plot">
          <PlotsWrapper plots={plots} plotType="boxplot" />
        </Tab>
        <Tab key="parallel-coordinate" title="Parallel Coordinate">
          <PlotsWrapper plots={plots} plotType="parallel-coordinate" />
        </Tab>
        <Tab key="moranscatter" title="Moran Scatter Plot">
          <PlotsWrapper plots={plots} plotType="moranscatter" />
        </Tab>
      </Tabs>
    </div>
  );
};
