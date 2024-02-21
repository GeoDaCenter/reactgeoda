import React, { useRef, useMemo } from 'react';
import { ScatterplotDataItemProps, ScatPlotDataProps } from '@/utils/scatterplot-utils';
import { ScatterChart } from 'echarts/charts';
import * as echarts from 'echarts/core';
import {
  TooltipComponent,
  GridComponent
} from 'echarts/components';
import ReactEChartsCore from 'echarts-for-react/lib/core';
import { Card, CardHeader, CardBody } from '@nextui-org/react';
import {
    CanvasRenderer
  } from 'echarts/renderers';

// Register the required ECharts components
echarts.use([
  TooltipComponent,
  GridComponent,
  ScatterChart,
  CanvasRenderer
]);

const createScatterplotOption = (data: ScatPlotDataProps) => {
  const seriesData = data.points.map((item: ScatterplotDataItemProps) => [item.x, item.y]);

  const option = {
    tooltip: {
      trigger: 'item',
      axisPointer: {
        type: 'cross'
      },
      formatter: function (params: {value: any}) {
        return `X: ${params.value[0]}<br/>Y: ${params.value[1]}`;
      }
    },
    xAxis: {
      type: 'value',
      name: data.variableX,
      nameLocation: 'middle',
      nameGap: 30
    },
    yAxis: {
      type: 'value',
      name: data.variableY,
      nameLocation: 'middle',
      nameGap: 50
    },
    series: [{
      type: 'scatter',
      symbolSize: 10,
      data: seriesData,
    }]
  };

  return option;
};

export const Scatterplot = ({data}: {data: ScatPlotDataProps}) => {
  const eChartsRef = useRef<ReactEChartsCore>(null);

  const option = useMemo(() => createScatterplotOption(data), [data]);

  return (
    <Card className="my-4">
      <CardHeader className="flex-col items-start px-4 pb-0 pt-2">
        <p className="text-tiny font-bold uppercase">Scatter Plot</p>
        <small className="text-default-500">{data.variableX} vs {data.variableY}</small>
      </CardHeader>
      <CardBody className="w-full py-2">
        <ReactEChartsCore
          echarts={echarts}
          option={option}
          notMerge={true}
          lazyUpdate={true}
          style={{height: '400px', width: '100%'}}
          ref={eChartsRef}
        />
      </CardBody>
    </Card>
  );
};
