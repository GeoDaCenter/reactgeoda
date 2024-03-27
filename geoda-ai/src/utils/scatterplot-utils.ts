export type ScatterplotDataItemProps = {
  x: number;
  y: number;
};

export type ScatPlotDataProps = {
  variableX: string;
  variableY: string;
  points: ScatterplotDataItemProps[];
};


export function createScatterplotData(variableX: string, variableY: string, xData: number[], yData: number[]): ScatPlotDataProps {
  if (xData.length !== yData.length) {
    throw new Error("xData and yData arrays must have the same length.");
  }

  const points = xData.map((x, index) => ({ x, y: yData[index] }));

  return {
    variableX,
    variableY,
    points,
  };
}






// const ChartSettings = {
//   defaultOptions: {
//     toolbox: {
//       show: true,
//       feature: {
//         mark: { show: true },
//         dataView: { show: true, readOnly: false },
//         restore: { show: true },
//         saveAsImage: { show: true }
//       }
//     }
//   },
//   theme: {
//     textStyle: {
//       fontFamily: 'Helvetica Neue, Arial, Verdana, sans-serif'
//     }
//   }
// };


// const createScatterplotOption = (data: ScatPlotDataProps) => {
// const seriesData = data.points.map((item: ScatterplotDataItemProps) => [item.x, item.y]);

// let option = {
//   tooltip: {
//     trigger: 'item',
//     axisPointer: {
//       type: 'cross'
//     },
//     formatter: function (params: {value: any}) {
//       return `X: ${params.value[0]}<br/>Y: ${params.value[1]}`;
//     }
//   },
//   xAxis: {
//     type: 'value',
//     name: data.variableX,
//     nameLocation: 'middle',
//     nameGap: 30
//   },
//   yAxis: {
//     type: 'value',
//     name: data.variableY,
//     nameLocation: 'middle',
//     nameGap: 30
//   },
//   series: [{
//     type: 'scatter',
//     symbolSize: 10,
//     data: seriesData,
//   }],
//   brush: {
//       toolbox: ['rect', 'polygon', 'clear', 'lineX', 'lineY', 'keep'],
//       xAxisIndex: 'all',
//       yAxisIndex: 'all',
//       brushLink: 'all',
//       outOfBrush: {
//         colorAlpha: 0.1,
//       },
//     },
//     toolbox: {
//       feature: {
//         brush: {
//           type: ['rect', 'polygon', 'clear', 'lineX', 'lineY', 'keep'],
//           xAxisIndex: 0,
//           title: {
//             rect: 'Rectangle selection',
//             polygon: 'Lasso selection',
//             clear: 'Clear selection',
//           },
//         },
//       },
//     },
//   grid: { 
//       left: '4%',
//       containLabel: true
//     }
//   };
// option = { ...ChartSettings.defaultOptions, ...option };

// return option;
// };

