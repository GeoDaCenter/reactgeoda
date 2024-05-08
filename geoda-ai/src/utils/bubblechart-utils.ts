export type BubbleChartDataProps = {
  variableX: string;
  variableY: string;
  variableSize: string;
  variableColor?: string;
};

export type BubbleChartOptionProps = {
  variableX: string;
  variableY: string;
  xData: number[];
  yData: number[];
  sizeData: number[];
  colorData?: number[];
};

export function getBubbleChartOption({
  variableX,
  variableY,
  xData,
  yData,
  sizeData,
  colorData
}: BubbleChartOptionProps) {
  const seriesData = xData.map((x, i) => [x, yData[i], sizeData[i], colorData?.[i] || 0]);

  const option = {
    xAxis: {
      type: 'value'
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        data: seriesData,
        type: 'scatter',
        symbolSize: function (data: any) {
          return data[2]; // the third element in the data array for size adjustments
        },
        itemStyle: {
          color: function (data: any) {
            return data[3] || 'lightblue'; // fourth element for color
          },
          borderColor: '#555',
          opacity: 0.5
        },
        emphasis: {
          focus: 'series',
          itemStyle: {
            borderColor: 'red'
          }
        },
        animationDelay: 0
      }
    ],
    tooltip: {
      trigger: 'item',
      formatter: function (params: any) {
        return (
          `${variableX}: ${params.value[0]}<br/>${variableY}: ${params.value[1]}<br/>Size: ${params.value[2]}` +
          (params.value[3] ? `<br/>Color: ${params.value[3]}` : '')
        );
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
    animation: false,
    progressive: 0
  };

  return option;
}
