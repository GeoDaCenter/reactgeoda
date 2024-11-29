import {numericFormatter} from './format-utils';
import {calculateLoessRegression} from '../math-utils';
import {RegressionResults} from '../math/linear-regression';

export type ScatPlotDataProps = {
  variableX: string;
  variableY: string;
};

function getRegressionLineData(
  allRegressionResults: RegressionResults,
  dataMinX: number,
  dataMaxX: number
) {
  const regression = allRegressionResults;
  const slope = regression.slope.estimate;
  const intercept = regression.intercept.estimate;
  const regressionLineData: [number, number][] = [
    [dataMinX, slope * dataMinX + intercept],
    [dataMaxX, slope * dataMaxX + intercept]
  ];
  return regressionLineData;
}

export function getScatterChartOption(
  xVariableName: string,
  xData: number[],
  yVariableName: string,
  yData: number[],
  showRegressionLine: boolean = false,
  showLoess: boolean = false,
  allRegressionResults: RegressionResults | null = null,
  selectedRegressionResults: RegressionResults | null = null,
  unselectedRegressionResults: RegressionResults | null = null
) {
  const seriesData = xData.map((x, i) => [x, yData[i]]);

  // Calculate regression line based on type
  const extendedMinX = Math.min(...xData);
  const extendedMaxX = Math.max(...xData);
  let regressionLineData: [number, number][] = [];
  let selectedRegressionLineData: [number, number][] = [];
  let unselectedRegressionLineData: [number, number][] = [];
  let loessResult;

  if (showRegressionLine && allRegressionResults) {
    regressionLineData = getRegressionLineData(allRegressionResults, extendedMinX, extendedMaxX);
    if (selectedRegressionResults) {
      selectedRegressionLineData = getRegressionLineData(
        selectedRegressionResults,
        extendedMinX,
        extendedMaxX
      );
    }
    if (unselectedRegressionResults) {
      unselectedRegressionLineData = getRegressionLineData(
        unselectedRegressionResults,
        extendedMinX,
        extendedMaxX
      );
    }
  }
  if (showLoess) {
    loessResult = calculateLoessRegression(xData, yData);
  }

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
      },
      ...(showRegressionLine
        ? [
            ...(selectedRegressionResults
              ? [
                  {
                    type: 'line',
                    data: selectedRegressionLineData,
                    showSymbol: false,
                    itemStyle: {
                      color: '#ff0000'
                    }
                  }
                ]
              : []),
            ...(unselectedRegressionResults
              ? [
                  {
                    type: 'line',
                    showSymbol: false,
                    data: unselectedRegressionLineData,
                    itemStyle: {
                      color: '#00ff00'
                    }
                  }
                ]
              : []),
            {
              type: 'line',
              data: regressionLineData,
              showSymbol: false,
              itemStyle: {
                color: '#800080'
              },
              lineStyle: {
                width: 2
              }
            }
          ]
        : []),
      ...(showLoess
        ? [
            {
              type: 'line',
              data: loessResult?.fitted,
              showSymbol: false,
              itemStyle: {
                color: '#0000ff'
              },
              lineStyle: {
                width: 2,
                type: 'solid'
              }
            },
            {
              type: 'line',
              data: loessResult?.lower.map((lowerValue, index) => [
                loessResult?.fitted[index][0],
                lowerValue[1]
              ]),
              showSymbol: false,
              lineStyle: {
                opacity: 0.5,
                type: 'dotted',
                width: 1
              },
              itemStyle: {
                color: '#ffffff'
              }
            },
            {
              type: 'line',
              data: loessResult?.upper.map((upperValue, index) => [
                loessResult?.fitted[index][0],
                upperValue[1]
              ]),
              showSymbol: false,
              lineStyle: {
                opacity: 0.5,
                type: 'dotted',
                width: 1
              },
              itemStyle: {
                color: '#ffffff'
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
      yAxisIndex: 0,
      brushOption: {
        brushType: 'rect',
        coordRange: [
          [0, 100],
          [0, 100]
        ]
      }
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
