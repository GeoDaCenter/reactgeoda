import {numericFormatter} from './format-utils';

export type ScatPlotDataProps = {
  variableX: string;
  variableY: string;
};

export function getScatterChartOption(
  xVariableName: string,
  xData: number[],
  yVariableName: string,
  yData: number[]
) {
  const seriesData = xData.map((x, i) => [x, yData[i]]);

  const option = {
    xAxis: {
      type: 'value',
      axisLabel: {
        formatter: numericFormatter
      }
    },
    yAxis: {
      type: 'value',
      splitLine: {show: false},
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
