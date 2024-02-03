import {ResponsiveBarCanvas} from '@nivo/bar';
import {HistogramPlotProps} from '@/actions/plot-actions';
import {Card, CardHeader, CardBody} from '@nextui-org/react';

/**
 * The react component of a histogram plot using Nivo bar chart
 */
export const HistogramPlot = ({props}: {props: HistogramPlotProps}) => {
  const plotData = props.data;
  const barData = plotData.map(d => {
    return {
      count: d.count,
      bin: `${d.binStart.toFixed(2)}`
    };
  });
  const commonProps = {
    margin: {top: 0, right: 0, bottom: 40, left: 0},
    indexBy: 'bin',
    padding: 0.2,
    axisLeft: null
  };

  return (
    <Card className="py-4">
      <CardHeader className="flex-col items-start px-4 pb-0 pt-2">
        <p className="text-tiny font-bold uppercase">Daily Mix</p>
        <small className="text-default-500">12 Tracks</small>
      </CardHeader>
      <CardBody className="h-40 w-full py-2">
        <ResponsiveBarCanvas {...commonProps} data={barData} keys={['count']} />
      </CardBody>
    </Card>
  );
};
