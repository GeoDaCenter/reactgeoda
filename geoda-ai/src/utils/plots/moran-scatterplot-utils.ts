import {numericFormatter} from './format-utils';
import {calculateLinearRegression} from '../math-utils';

export type MoranScatPlotDataProps = {
  variableX: string;
  variableY: string;
};

export function getMoranScatterChartOption(
  xVariableName: string,
  xData: number[],
  yVariableName: string,
  yData: number[]
) {
  const seriesData = xData.map((x, i) => [x, yData[i]]);

  // Calculate regression line based on type
  const regression = calculateLinearRegression(xData, yData);
  const slope = regression.slope;
  const intercept = regression.intercept;

  const padding = (Math.max(...xData) - Math.min(...xData)) * 0.2;
  const extendedMinX = Math.min(...xData) - padding;
  const extendedMaxX = Math.max(...xData) + padding;
  const regressionLineData = [
    [extendedMinX, slope * extendedMinX + intercept],
    [extendedMaxX, slope * extendedMaxX + intercept]
  ];

  const option = {
    title: {
      text: `Moran's I ${slope.toFixed(3)}`,
      left: 'center',
      top: 10,
      textStyle: {
        fontSize: 10
      }
    },
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
      },
      {
        type: 'line',
        data: regressionLineData,
        showSymbol: false,
        itemStyle: {
          color: '#ff6666'
        },
        lineStyle: {
          width: 2,
          type: 'dashed'
        }
      }
    ],
    tooltip: {
      trigger: 'item',
      zlevel: 1000000,
      formatter: function (params: any) {
        return `${xVariableName}: ${numericFormatter(params.value[0])}<br/>${yVariableName}: ${numericFormatter(params.value[1])}`;
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
