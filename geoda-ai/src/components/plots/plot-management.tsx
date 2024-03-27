import {useSelector} from 'react-redux';
import {Tab, Tabs} from '@nextui-org/react';

import {BoxPlot} from './box-plot';
import {HistogramPlot} from './histogram-plot';
import {Scatterplot} from './scat-plot';
import {
  HistogramPlotProps,
  BoxPlotProps,
  ParallelCoordinateProps,
  PlotProps
, ScatterPlotProps} from '@/actions/plot-actions';
import {GeoDaState} from '@/store';
import {ParallelCoordinatePlot} from './parallel-coordinate-plot';

// type guard function to check if the plot is a histogram plot
function isHistogramPlot(plot: PlotProps): plot is HistogramPlotProps {
  return plot.type === 'histogram';
}

// type guard function to check if the plot is a boxplot
function isBoxPlot(plot: PlotProps): plot is BoxPlotProps {
  return plot.type === 'boxplot';
}

// type guard function to check if the plot is a boxplot
function isParallelCoordinate(plot: PlotProps): plot is ParallelCoordinateProps {
  return plot.type === 'parallel-coordinate';
}

// type guard function to check if the plot is a scatter plot
function isScatterPlot(plot: PlotProps): plot is ScatterPlotProps {
  return plot.type === 'scatter';
}


export const PlotManagementPanel = () => {
  // use selector to get plots
  const plots = useSelector((state: GeoDaState) => state.root.plots);

  return (
    <div className="flex flex-col overflow-y-scroll">
      <Tabs aria-label="Options" color="primary" variant="underlined" className="overflow-y-auto">
        <Tab
          key="all"
          title={
            <div className="flex items-center space-x-2">
              <span>All</span>
            </div>
          }
          className="overflow-y-auto"
        >
          {plots.toReversed().map(plot => {
            if (isHistogramPlot(plot)) {
              return <HistogramPlot key={plot.id} props={plot} />;
            } else if (isBoxPlot(plot)) {
              return <BoxPlot key={plot.id} props={plot} />;
            } else if (isParallelCoordinate(plot)) {
              return <ParallelCoordinatePlot key={plot.id} props={plot} />;
            } else if (isScatterPlot(plot)) {
              return <Scatterplot key={plot.id} data={plot} />;
            }
          })}
        </Tab>
        <Tab
          key="histogram"
          title={
            <div className="flex items-center space-x-2">
              <span>Histogram</span>
            </div>
          }
          className="p-2"
        >
          {plots
            .filter(plot => plot.type === 'histogram')
            .toReversed()
            .map(plot => {
              if (isHistogramPlot(plot)) {
                return <HistogramPlot key={plot.id} props={plot} />;
              }
            })}
        </Tab>
        <Tab
          key="scatter"
          title={<div className="flex items-center space-x-2"><span>Scatter Plot</span></div>}
          className="p-2"
        >
          {plots
            .filter(plot => plot.type === 'scatter')
            .toReversed()
            .map(plot => {
              if (isScatterPlot(plot)) {
                return <Scatterplot key={plot.id} data={plot.data[0]} />
              }
            })}
        </Tab>
        <Tab
          key="boxplot"
          title={
            <div className="flex items-center space-x-2">
              <span>Box plot</span>
            </div>
          }
          className="p-2"
        >
          {plots
            .filter(plot => plot.type === 'boxplot')
            .toReversed()
            .map(plot => {
              if (isBoxPlot(plot)) {
                return <BoxPlot key={plot.id} props={plot} />;
              }
            })}
        </Tab>
        <Tab
          key="parallel-coordinate"
          title={
            <div className="flex items-center space-x-2">
              <span>Parallel Coordinate</span>
            </div>
          }
          className="p-2"
        >
          {plots
            .filter(plot => plot.type === 'parallel-coordinate')
            .toReversed()
            .map(plot => {
              if (isParallelCoordinate(plot)) {
                console.log(plot);
                return <ParallelCoordinatePlot key={plot.id} props={plot} />;
              }
            })}
        </Tab>
      </Tabs>
    </div>
  );
};
