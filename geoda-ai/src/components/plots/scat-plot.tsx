import React, { useRef, useMemo } from 'react';
import { ScatterplotDataItemProps, ScatPlotDataProps } from '@/utils/scatterplot-utils';
import { ScatterChart } from 'echarts/charts';
import * as echarts from 'echarts/core';
//import { transform } from 'echarts-stat';
import {useDispatch, useSelector} from 'react-redux';
import {GeoDaState} from '@/store';
import {
  TooltipComponent,
  GridComponent,
  BrushComponent,
  ToolboxComponent
  //DataZoomComponent
} from 'echarts/components';
import {GeojsonLayer, Layer} from '@kepler.gl/layers';
import ReactEChartsCore from 'echarts-for-react/lib/core';
import {MAP_ID} from '@/constants';
import { Card, CardHeader, CardBody } from '@nextui-org/react';
import {
    CanvasRenderer
  } from 'echarts/renderers';

// Register the required ECharts components
echarts.use([
  TooltipComponent,
  GridComponent,
  ScatterChart,
  CanvasRenderer,
  BrushComponent,
  ToolboxComponent
  //DataZoomComponent
]);
//echarts.registerTransform(transform.regression);

const ChartSettings = {
    defaultOptions: {
      toolbox: {
        show: true,
        feature: {
          mark: { show: true },
          dataView: { show: true, readOnly: false },
          restore: { show: true },
          saveAsImage: { show: true }
        }
      }
    },
    theme: {
      textStyle: {
        fontFamily: 'Helvetica Neue, Arial, Verdana, sans-serif'
      }
    }
  };
  

const createScatterplotOption = (data: ScatPlotDataProps) => {
  const seriesData = data.points.map((item: ScatterplotDataItemProps) => [item.x, item.y]);

  let option = {
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
      nameGap: 30
    },
    series: [{
      type: 'scatter',
      symbolSize: 10,
      data: seriesData,
    }],
    brush: {
        toolbox: ['rect', 'polygon', 'clear'],
        xAxisIndex: 'all',
        yAxisIndex: 'all',
        brushLink: 'all',
        outOfBrush: {
          colorAlpha: 0.1,
        },
      },
      toolbox: {
        feature: {
          brush: {
            type: ['rect', 'polygon', 'clear'],
            title: {
              rect: 'Rectangle selection',
              polygon: 'Lasso selection',
              clear: 'Clear selection',
            },
          },
        },
      },
    grid: { 
        left: '4%',
        containLabel: true
      }
    };
  option = { ...ChartSettings.defaultOptions, ...option };

  return option;
};

export const Scatterplot = ({data}: {data: ScatPlotDataProps}) => {
  const dispatch = useDispatch();
  const eChartsRef = useRef<ReactEChartsCore>(null);

  // use selector to get theme and table name
  const theme = useSelector((state: GeoDaState) => state.root.uiState.theme);
  const tableName = useSelector((state: GeoDaState) => state.root.file?.rawFileData?.name);

  // use selector to get layer using tableName as layer.label
  const filteredIndex = useSelector((state: GeoDaState) => {
    const layer: GeojsonLayer = state.keplerGl[MAP_ID].visState.layers.find((layer: Layer) =>
      tableName.startsWith(layer.config.label)
    );
    return layer.filteredIndex;
  });

  const option = useMemo(() => createScatterplotOption(data), [data]);

  const onEvents = {
    brushSelected: function (params: any) {
      const brushed = [];
      const brushComponent = params.batch[0];
      for (let sIdx = 0; sIdx < brushComponent.selected.length; sIdx++) {
        const rawIndices = brushComponent.selected[sIdx].dataIndex;
        brushed.push(...rawIndices);
      }

      // Dispatch action to highlight selected indices
      dispatch({
        type: 'SET_FILTER_INDEXES',
        payload: {dataLabel: tableName, filteredIndex: brushed}
      });
    }
  };

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
