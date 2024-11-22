import {numericFormatter} from './format-utils';

export type ScatPlotDataProps = {
  variableX: string;
  variableY: string;
};

// Add these helper functions for linear regression calculation
function calculateLinearRegression(xData: number[], yData: number[]) {
  const n = xData.length;
  let sumX = 0,
    sumY = 0,
    sumXY = 0,
    sumXX = 0;

  for (let i = 0; i < n; i++) {
    sumX += xData[i];
    sumY += yData[i];
    sumXY += xData[i] * yData[i];
    sumXX += xData[i] * xData[i];
  }

  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  return {slope, intercept};
}

export function getScatterChartOption(
  xVariableName: string,
  xData: number[],
  yVariableName: string,
  yData: number[],
  showRegressionLine: boolean = false
) {
  const seriesData = xData.map((x, i) => [x, yData[i]]);

  // Calculate regression line
  const {slope, intercept} = calculateLinearRegression(xData, yData);
  // Extend regression line to entire plot
  const padding = (Math.max(...xData) - Math.min(...xData)) * 0.2;
  const extendedMinX = Math.min(...xData) - padding;
  const extendedMaxX = Math.max(...xData) + padding;
  const regressionLineData = [
    [extendedMinX, slope * extendedMinX + intercept],
    [extendedMaxX, slope * extendedMaxX + intercept]
  ];

  const option = {
    ...(showRegressionLine
      ? {
          title: {
            text: `Moran's I ${slope.toFixed(3)}`,
            left: 'center',
            top: 10,
            textStyle: {
              fontSize: 10
            }
          }
        }
      : {}),
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
      ...(showRegressionLine
        ? [
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
          ]
        : [])
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
