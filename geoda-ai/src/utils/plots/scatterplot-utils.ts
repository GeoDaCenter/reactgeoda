import {ScatterPlotProps} from '@/actions/plot-actions';
import {numericFormatter} from './format-utils';

export type ScatterplotDataItemProps = {
  x: number;
  y: number;
};

export type ScatPlotDataProps = {
  variableX: string;
  variableY: string;
  points: ScatterplotDataItemProps[];
};

export function createScatterplotData(
  variableX: string,
  variableY: string,
  xData: number[],
  yData: number[]
): ScatPlotDataProps {
  if (xData.length !== yData.length) {
    throw new Error('xData and yData arrays must have the same length.');
  }

  const points = xData.map((x, index) => ({x, y: yData[index]}));

  return {
    variableX,
    variableY,
    points
  };
}

export function getScatterChartOption(filteredIndex: number[] | null, props: ScatterPlotProps) {
  const seriesData = props.data.points.map(point => [point.x, point.y]);
  const xVariableName = props.data.variableX;
  const yVariableName = props.data.variableY;

  const option = {
    xAxis: {
      type: 'value',
      axisLabel: {
        formatter: numericFormatter
      }
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        formatter: numericFormatter
      }
    },
    series: [
      {
        data: seriesData,
        type: 'scatter',
        symbolSize: 6,
        itemStyle: {
          color: 'lightblue',
          borderColor: '#555',
          opacity: 0.8,
          borderWidth: 1
        },
        // highlight
        emphasis: {
          // focus: 'series',
          symbolSize: 6,
          itemStyle: {
            color: 'red',
            borderWidth: 1
          }
        },
        animationDelay: 0
      }
    ],
    tooltip: {
      trigger: 'item',
      formatter: function (params: any) {
        return `${xVariableName}: ${params.value[0]}<br/>${yVariableName}: ${params.value[1]}`;
      },
      axisPointer: {
        type: 'cross'
      }
    },
    brush: {
      toolbox: ['rect', 'polygon', 'clear'],
      xAxisIndex: 0,
      yAxisIndex: 0
    },
    grid: {
      left: '3%',
      right: '5%',
      bottom: '3%',
      containLabel: true
    },
    // avoid flickering when brushing
    animation: false,
    progressive: 0
  };

  return option;
}
