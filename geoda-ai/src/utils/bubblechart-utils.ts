import {BubbleChartProps} from '@/actions/plot-actions';

export type BubbleChartDataItemProps = {
  x: number;
  y: number;
  size: number;
  color?: string | number;
};

export type BubbleChartDataProps = {
  variableX: string;
  variableY: string;
  variableSize: string;
  variableColor?: string;
  points: BubbleChartDataItemProps[];
};

export function createBubbleChartData(
  variableX: string,
  variableY: string,
  variableSize: string,
  variableColor: string | undefined,
  xData: number[],
  yData: number[],
  sizeData: number[],
  colorData?: (string | number)[]
): BubbleChartDataProps {
  if (xData.length !== yData.length || xData.length !== sizeData.length) {
    throw new Error('xData, yData, and sizeData arrays should be same length.');
  }

  const points = xData.map((x, index) => ({
    x: x,
    y: yData[index],
    size: sizeData[index],
    color: colorData ? colorData[index] : undefined
  }));

  return {
    variableX,
    variableY,
    variableSize,
    variableColor,
    points
  };
}

export function getBubbleChartOption(
  filteredIndex: Uint8ClampedArray | null,
  props: BubbleChartProps
) {
  const seriesData = props.data.points.map(point => [point.x, point.y, point.size, point.color]);
  const xVariableName = props.data.variableX;
  const yVariableName = props.data.variableY;

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
          return data[2]; // thhird element in the data array for size adjustments
        },
        itemStyle: {
          color: function (data: any) {
            return data[3] || 'lightblue'; // fourth element for color
          },
          borderColor: '#555',
          opacity: 0.8
        },
        emphasis: {
          focus: 'series'
        },
        animationDelay: 0
      }
    ],
    tooltip: {
      trigger: 'item',
      formatter: function (params: any) {
        return `${xVariableName}: ${params.value[0]}<br/>${yVariableName}: ${params.value[1]}<br/>Size: ${params.value[2]}` +
               (params.value[3] ? `<br/>Color: ${params.value[3]}` : '');
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
