import {GeoDaState} from '@/store';
import {useMemo} from 'react';
import {useSelector} from 'react-redux';
import {HistogramPlot} from './histogram-plot';
import {HistogramPlotProps} from '@/actions/plot-actions';

export const PlotManagementPanel = () => {
  // use selector to get plots
  const plots = useSelector((state: GeoDaState) => state.root.plots);

  // get all histogram plots from plots array use useMemo
  const histogramPlots = useMemo(() => {
    const selPlots: HistogramPlotProps[] = [];
    plots.forEach(plot => {
      if (plot.type === 'histogram') {
        selPlots.push(plot);
      }
    });
    return selPlots;
  }, [plots]);

  return (
    <div className="flex flex-col gap-4">
      {histogramPlots.map((plot: HistogramPlotProps) => {
        return <HistogramPlot key={plot.id} props={plot} />;
      })}
    </div>
  );
};
