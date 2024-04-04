import {useSelector} from 'react-redux';
import {Tab, Tabs} from '@nextui-org/react';

import {BoxPlot} from './box-plot';
import {HistogramPlot} from './histogram-plot';
import {Scatterplot} from './scat-plot';
import {
  HistogramPlotProps,
  BoxPlotProps,
  ParallelCoordinateProps,
  PlotProps,
  ScatterPlotProps
} from '@/actions/plot-actions';
import {GeoDaState} from '@/store';
import {ParallelCoordinatePlot} from './parallel-coordinate-plot';

// type guard function to check if the plot is a histogram plot
export function isHistogramPlot(plot: PlotProps): plot is HistogramPlotProps {
  return plot.type === 'histogram';
}

// type guard function to check if the plot is a boxplot
export function isBoxPlot(plot: PlotProps): plot is BoxPlotProps {
  return plot.type === 'boxplot';
}

// type guard function to check if the plot is a boxplot
export function isParallelCoordinate(plot: PlotProps): plot is ParallelCoordinateProps {
  return plot.type === 'parallel-coordinate';
}

// type guard function to check if the plot is a scatter plot
export function isScatterPlot(plot: PlotProps): plot is ScatterPlotProps {
  return plot.type === 'scatter';
}

// PlotWrapper component with fixed height
export function PlotWrapper(plot: PlotProps, isFixedHeight = true) {
  return (
    <div className={isFixedHeight ? 'h-[280px] w-full p-1' : 'h-full w-full'}>
      {isHistogramPlot(plot) ? (
        <HistogramPlot key={plot.id} props={plot} />
      ) : isBoxPlot(plot) ? (
        <BoxPlot key={plot.id} props={plot} />
      ) : isParallelCoordinate(plot) ? (
        <ParallelCoordinatePlot key={plot.id} props={plot} />
      ) : isScatterPlot(plot) ? (
        <Scatterplot key={plot.id} props={plot} />
      ) : null}
    </div>
  );
}

const PlotsWrapper = ({plots, plotType}: {plots: PlotProps[]; plotType?: string}) => {
  const filteredPlots = plotType ? plots.filter(plot => plot.type === plotType) : plots;
  return (
    <div className="flow flow-col space-y-2">
      {filteredPlots.toReversed().map(plot => PlotWrapper(plot))}
    </div>
  );
};

export const PlotManagementPanel = () => {
  // use selector to get plots
  const plots = useSelector((state: GeoDaState) => state.root.plots);

  return (
    <div className="flex flex-col overflow-y-scroll">
      <Tabs aria-label="Options" color="primary" variant="underlined" classNames={{}} size="md">
        <Tab key="all" title="All">
          <PlotsWrapper plots={plots} />
        </Tab>
        <Tab key="histogram" title="Histogram">
          <PlotsWrapper plots={plots} plotType="histogram" />
        </Tab>
        <Tab key="scatter" title="Scatter Plot">
          <PlotsWrapper plots={plots} plotType="scatter" />
        </Tab>
        <Tab key="boxplot" title="Box plot">
          <PlotsWrapper plots={plots} plotType="boxplot" />
        </Tab>
        <Tab key="parallel-coordinate" title="Parallel Coordinate">
          <PlotsWrapper plots={plots} plotType="parallel-coordinate" />
        </Tab>
      </Tabs>
    </div>
  );
};
