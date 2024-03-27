import React, {useRef, RefObject, useMemo, useEffect} from 'react';
//import {ScatterplotDataItemProps, ScatPlotDataProps} from '@/utils/scatterplot-utils';
import {ScatterChart} from 'echarts/charts';
import * as echarts from 'echarts/core';
//import { transform } from 'echarts-stat';
import {useDispatch, useSelector} from 'react-redux';
import {GeoDaState} from '@/store';
import {Filter} from '@kepler.gl/types';
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
import {Card, CardHeader, CardBody} from '@nextui-org/react';
import {CanvasRenderer} from 'echarts/renderers';
import {ScatterPlotProps} from '@/actions/plot-actions';
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

function getChartOption(filteredIndex: Uint8ClampedArray | null, props: ScatterPlotProps) {
  const hasHighlighted = filteredIndex ? Array.from(filteredIndex).some(idx => idx === 0) : true;

  const allPoints = props.data.flatMap(dataItem => dataItem.points);

  const seriesData = allPoints.map((point, i) => {
    const isHighlighted = filteredIndex ? filteredIndex[i] === 0 : hasHighlighted;
    return {
      value: [point.x, point.y],
      itemStyle: {
        color: isHighlighted ? 'rgb(255, 70, 131)' : 'rgb(255, 70, 200)', // Highlight color vs default
        opacity: isHighlighted ? 0.5 : 1 // Highlighted points are fully opaque
      }
    };
  });

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
        symbolSize: 10
      }
    ],
    tooltip: {
      trigger: 'item',
      formatter: function (params: any) {
        return `X: ${params.value[0]}<br/>Y: ${params.value[1]}`;
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
    }
  };

  return option;
}

type EChartsUpdaterProps = {
  filteredIndex: Uint8ClampedArray | null;
  eChartsRef: RefObject<ReactEChartsCore>;
  props: ScatterPlotProps;
  getChartOption: (filteredIndex: Uint8ClampedArray | null, props: ScatterPlotProps) => any;
};

const EChartsUpdater = ({
  filteredIndex,
  eChartsRef,
  props,
  getChartOption
}: EChartsUpdaterProps) => {
  // use selector to get filteredIndexTrigger
  // const filteredIndexTrigger = useSelector((state: GeoDaState) => {
  //   const layer: GeojsonLayer = state.keplerGl[MAP_ID].visState.layers.find((layer: Layer) =>
  //     tableName.startsWith(layer.config.label)
  //   );
  //   return layer.filteredIndexTrigger;
  // });

  // use selector to get filters with type === 'polygon'
  const polygonFilter = useSelector((state: GeoDaState) => {
    const polyFilter = state.keplerGl[MAP_ID].visState.filters.find(
      (f: Filter) => f.type === 'polygon' && f.enabled === true
    );
    return polyFilter?.value?.geometry;
  });

  // when filteredIndexTrigger changes, update the chart option using setOption
  useEffect(() => {
    if (eChartsRef.current && polygonFilter) {
      console.log('EChartsUpdater setOption');
      const updatedOption = getChartOption(filteredIndex, props);
      const chart = eChartsRef.current;
      if (chart) {
        const chartInstance = chart.getEchartsInstance();
        // chartInstance.dispatchAction({type: 'brush', command: 'clear', areas: []});
        chartInstance.setOption(updatedOption, true);
      }
    }
  }, [eChartsRef, filteredIndex, getChartOption, polygonFilter, props]);

  return null;
};

export const Scatterplot = ({data}: {data: ScatterPlotProps}) => {
  const dispatch = useDispatch();
  const eChartsRef = useRef<ReactEChartsCore>(null);

  // use selector to get theme and table name
  const theme = useSelector((state: GeoDaState) => state.root.uiState.theme);
  const tableName = useSelector((state: GeoDaState) => state.root.file?.rawFileData?.fileName);

  // use selector to get layer using tableName as layer.label
  const filteredIndex = useSelector((state: GeoDaState) => {
    const layer: GeojsonLayer = state.keplerGl[MAP_ID].visState.layers.find((layer: Layer) =>
      tableName.startsWith(layer.config.label)
    );
    return layer.filteredIndex;
  });

  // use selector to check if plot is in state
  const validPlot = useSelector((state: GeoDaState) =>
    state.root.plots.find(p => p.id === data.id)
  );

  // get chart option by calling getChartOption only once
  const option = useMemo(() => {
    return getChartOption(filteredIndex, data);
  }, [filteredIndex, data]);

  const bindEvents = {
    brushSelected: function (params: any) {
      const brushed = [];
      const brushComponent = params.batch[0];
      for (let sIdx = 0; sIdx < brushComponent.selected.length; sIdx++) {
        const rawIndices = brushComponent.selected[sIdx].dataIndex;
        brushed.push(...rawIndices);
      }

      // get selected ids from brushed bars
      // const filteredIndex =
      //   brushed.length > 0
      //     ? brushed.map((idx: number) => data.data[idx].points.map(item => item.index)).flat()
      //     : [];

      if (validPlot && brushed.length === 0) {
        // reset options
        const chart = eChartsRef.current;
        if (chart) {
          const chartInstance = chart.getEchartsInstance();
          const updatedOption = getChartOption(null, data);
          chartInstance.setOption(updatedOption);
        }
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
        <small className="text-default-500">
          {data.variableX} vs {data.variableY}
        </small>
      </CardHeader>
      <CardBody className="w-full py-2">
        <ReactEChartsCore
          echarts={echarts}
          option={option}
          notMerge={true}
          lazyUpdate={true}
          theme={theme}
          onEvents={bindEvents}
          style={{height: '400px', width: '100%'}}
          ref={eChartsRef}
        />
        {validPlot && (
          <EChartsUpdater
            filteredIndex={filteredIndex}
            eChartsRef={eChartsRef}
            props={data}
            getChartOption={getChartOption}
          />
        )}
      </CardBody>
    </Card>
  );
};
