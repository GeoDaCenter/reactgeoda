import {useSelector} from 'react-redux';
import {Tab, Tabs} from '@nextui-org/react';
import {ResizableBox} from 'react-resizable';
import 'react-resizable/css/styles.css';

import {BoxPlot} from './box-plot';
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

// PlotWrapper component with fixed height
export function PlotWrapper(plot: PlotStateProps) {
  return (
    <div className="mb-4 h-full w-full">
      {isHistogramPlot(plot) ? (
        <HistogramPlot key={plot.id} props={plot} />
      ) : isBoxPlot(plot) ? (
        <BoxPlot key={plot.id} props={plot} />
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

const PlotsWrapper = ({plots, plotType}: {plots: PlotStateProps[]; plotType?: string}) => {
  const filteredPlots = plotType ? plots.filter(plot => plot.type === plotType) : plots;
  return (
    <div className="flow flow-col space-y-2">
      {filteredPlots.toReversed().map(plot => (
        <ResizableBox
          key={plot.id}
          width={Infinity}
          height={280}
          minConstraints={[Infinity, 280]}
          maxConstraints={[Infinity, 600]}
          resizeHandles={['se']}
          handle={
            <div className="group absolute bottom-0 right-0 h-6 w-6 cursor-se-resize">
              <div className="flex h-full w-full items-center justify-center transition-colors hover:bg-gray-100/10">
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 12 12"
                  className="text-gray-300 group-hover:text-gray-400"
                >
                  <path d="M11 6V11H6" stroke="currentColor" strokeWidth="2" fill="none" />
                </svg>
              </div>
            </div>
          }
        >
          {PlotWrapper(plot)}
        </ResizableBox>
      ))}
    </div>
  );
};

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
